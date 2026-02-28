package ucr.ac.cr.inii.geoterra.domain.camera

import android.content.ContentValues
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import androidx.exifinterface.media.ExifInterface
import android.provider.MediaStore
import androidx.activity.ComponentActivity
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.result.launch
import android.content.Context
import android.net.Uri
import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.coroutines.withContext
import kotlinx.coroutines.withTimeout
import ucr.ac.cr.inii.geoterra.data.model.local.UserLocation
import ucr.ac.cr.inii.geoterra.domain.location.LocationProvider
import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream
import kotlin.coroutines.resume

class AndroidCameraManager(
  private val context: Context,
  private val locationProvider: LocationProvider
) : CameraManager {
  private val TAG = "CAMERA_DEBUG"
  private val cameraResultChannel = Channel<Boolean>()
  var onLaunchCamera: ((Uri) -> Unit)? = null
  var onLaunchGallery: (((Uri?) -> Unit) -> Unit)? = null
  
  fun onCameraResult(success: Boolean) {
    Log.d(TAG, "onCameraResult recibido: $success")
    cameraResultChannel.trySend(success)
  }
  
  override suspend fun takePhotoWithLocation(): Pair<ByteArray, UserLocation?>? {
    Log.d(TAG, "Iniciando takePhotoWithLocation...")
    
    val currentLocation = withContext(Dispatchers.Default) {
      try {
        locationProvider.observeLocation().firstOrNull()
      } catch (e: Exception) { null }
    }
    
    val filename = "GEO_${System.currentTimeMillis()}.jpg"
    val values = ContentValues().apply {
      put(MediaStore.Images.Media.DISPLAY_NAME, filename)
      put(MediaStore.Images.Media.MIME_TYPE, "image/jpeg")
      put(MediaStore.Images.Media.RELATIVE_PATH, "Pictures/GeoTerra")
    }
    
    val resolver = context.contentResolver
    val imageUri = resolver.insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, values) ?: return null
    
    Log.d(TAG, "Uri creado: $imageUri. Lanzando cámara...")
    
    withContext(Dispatchers.Main) {
      onLaunchCamera?.invoke(imageUri)
    }
    
    val success = cameraResultChannel.receive()
    kotlinx.coroutines.delay(1500)
    Log.d(TAG, "Cámara retornó success=$success. Esperando sincronización de disco...")
    
    kotlinx.coroutines.delay(1500)
    
    val bytes = withContext(Dispatchers.IO) {
      try {
        resolver.openInputStream(imageUri)?.use { it.readBytes() }
      } catch (e: Exception) {
        Log.e(TAG, "Error leyendo bytes: ${e.message}")
        null
      }
    }
    
    val hasData = bytes != null && bytes.isNotEmpty()
    Log.d(TAG, "Resultado: success=$success, bytes detectados=${bytes?.size ?: 0}")
    
    // Si no hay datos, no hay nada que hacer
    if (!hasData) {
      Log.e(TAG, "ERROR: El archivo sigue vacío después de esperar. Borrando Uri.")
      resolver.delete(imageUri, null, null)
      return null
    }
    
    // 4. SI HAY DATOS, PROCEDEMOS (aunque success sea false)
    if (currentLocation != null) {
      writeLocationToExif(imageUri, currentLocation)
    }
    
    // Notificar a la galería que el archivo está listo
    android.media.MediaScannerConnection.scanFile(context, arrayOf(imageUri.path), null, null)
    
    Log.d(TAG, "PROCESO EXITOSO. Devolviendo bytes.")
    
    return withContext(Dispatchers.IO) {
      try {
        context.contentResolver.openInputStream(imageUri)?.use { input ->
          val bytes = input.readBytes()
          Log.d(TAG, "Bytes leídos (con EXIF incluido si hubo): ${bytes.size}")
          Pair(bytes, currentLocation)
        }
      } catch (e: Exception) {
        Log.e(TAG, "Error leyendo bytes finales: ${e.message}")
        null
      }
    }
  }
  
  /**
   * Writes GPS metadata into an image stored in MediaStore using a writable FileDescriptor.
   *
   * This implementation ensures:
   *  - Proper EXIF mutation support
   *  - No image re-encoding
   *  - Atomic metadata persistence
   *
   * @param imageUri The Uri pointing to the image in MediaStore.
   * @param location The domain location model containing coordinates.
   */
  private suspend fun writeLocationToExif(
    imageUri: Uri,
    location: UserLocation
  ) = withContext(Dispatchers.IO) {
    
    // Open the file descriptor in read-write mode.
    context.contentResolver.openFileDescriptor(imageUri, "rw")?.use { pfd ->
      
      // Create ExifInterface using the file descriptor (supports mutation).
      val exif = ExifInterface(pfd.fileDescriptor)
      
      // Write GPS coordinates using the internal DMS rational conversion.
      exif.setLatLong(location.latitude, location.longitude)
      
      
      // Persist all EXIF changes in a single write operation.
      exif.saveAttributes()
    }
  }
  
  override suspend fun pickPhotoFromGallery(): ByteArray? = suspendCancellableCoroutine { cont ->
    onLaunchGallery?.invoke { uri ->
      if (uri == null) {
        if (cont.isActive) cont.resume(null)
        return@invoke
      }
      
      try {
        val bytes = context.contentResolver.openInputStream(uri)?.use { it.readBytes() }
        if (cont.isActive) cont.resume(bytes)
      } catch (e: Exception) {
        if (cont.isActive) cont.resume(null)
      }
    } ?: run {
      if (cont.isActive) {
        cont.resume(null)
      }
    }
  }
  
  private fun saveToGallery(bitmap: Bitmap) {
    val filename = "GEO_${System.currentTimeMillis()}.jpg"
    val values = ContentValues().apply {
      put(MediaStore.Images.Media.DISPLAY_NAME, filename)
      put(MediaStore.Images.Media.MIME_TYPE, "image/jpeg")
      put(MediaStore.Images.Media.RELATIVE_PATH, "Pictures/GeoTerra")
    }
    
    val resolver = context.contentResolver
    
    val uri = resolver.insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, values)
    uri?.let {
      context.contentResolver.openOutputStream(it).use { out ->
        bitmap.compress(Bitmap.CompressFormat.JPEG, 90, out!!)
      }
    }
  }
  
  override fun extractLocationFromCache(imageData: ByteArray): UserLocation? {
    return try {
      val inputStream = ByteArrayInputStream(imageData)
      val exif = ExifInterface(inputStream)
      val latLong = FloatArray(2)
      if (exif.getLatLong(latLong)) {
        UserLocation(
          latitude = latLong[0].toDouble(),
          longitude = latLong[1].toDouble(),
          accuracy = 0f
        )
      } else null
    } catch (e: Exception) {
      null
    }
  }
}