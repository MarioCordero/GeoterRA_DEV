package ucr.ac.cr.inii.geoterra.domain.camera

import android.content.ContentValues
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.net.Uri
import android.os.Build
import android.provider.MediaStore
import android.util.Log
import androidx.core.content.FileProvider
import androidx.exifinterface.media.ExifInterface
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.delay
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.coroutines.withContext
import ucr.ac.cr.inii.geoterra.data.model.local.UserLocation
import java.io.ByteArrayInputStream
import java.io.File
import kotlin.coroutines.resume

class AndroidCameraManager(
  private val context: Context,
) : CameraManager {
  private val TAG = "CAMERA_DEBUG"
  private val cameraResultChannel = Channel<Boolean>()
  var onLaunchCamera: ((Uri) -> Unit)? = null
  var onLaunchGallery: (((Uri?) -> Unit) -> Unit)? = null

  fun onCameraResult(success: Boolean) {
    Log.d(TAG, "onCameraResult recibido: $success")
    cameraResultChannel.trySend(success)
  }

  override suspend fun takePhotoWithLocation(location: UserLocation): Pair<ByteArray, UserLocation?>? {
    val tempCameraFile = createTempImageFile("camera_")
    val tempCameraUri = FileProvider.getUriForFile(
      context,
      "${context.packageName}.fileprovider",
      tempCameraFile
    )

    withContext(Dispatchers.Main) {
      onLaunchCamera?.invoke(tempCameraUri)
    }

    val success = cameraResultChannel.receive()
    if (!success) {
      Log.e(TAG, "La cámara no tuvo éxito")
      tempCameraFile.delete()
      return null
    }

    if (!waitForFileReady(tempCameraUri)) {
      Log.e(TAG, "Archivo de cámara no listo, eliminando temporal")
      tempCameraFile.delete()
      return null
    }
    Log.d(TAG, "Archivo de cámara listo")

    val tempWorkingFile = createTempImageFile("working_")
    tempCameraFile.copyTo(tempWorkingFile, overwrite = true)
    Log.d(TAG, "Copia de trabajo creada: ${tempWorkingFile.absolutePath}")

    var exifWritten = false
    if (location.latitude != 0.0 && location.longitude != 0.0) {
      exifWritten = writeLocationToExifFile(tempWorkingFile, location)
    } else {
      Log.d(TAG, "Ubicación 0.0, no se escribe EXIF")
    }

    if (!exifWritten) {
      Log.e(TAG, "No se pudieron escribir los metadatos, se procede sin ellos")
    }

    val verificationBytes = tempWorkingFile.readBytes()
    val testExif = ExifInterface(ByteArrayInputStream(verificationBytes))
    val testLat = testExif.getAttribute(ExifInterface.TAG_GPS_LATITUDE)
    Log.d(TAG, "Verificación en copia - latitud: $testLat")
    if (testLat == null || testLat == "0/1,0/1,0/1") {
      Log.e(TAG, "¡Los metadatos no se persistieron en la copia!")
    }

    val finalBytes = tempWorkingFile.readBytes()
    val finalUri = saveImageToMediaStore(finalBytes)

    tempCameraFile.delete()
    tempWorkingFile.delete()

    if (finalUri != null) {
      val checkBytes = context.contentResolver.openInputStream(finalUri)?.use { it.readBytes() }
      val checkExif = ExifInterface(ByteArrayInputStream(checkBytes))
      val checkLat = checkExif.getAttribute(ExifInterface.TAG_GPS_LATITUDE)
      Log.d(TAG, "Metadatos en MediaStore: $checkLat")
      if (checkLat == null || checkLat == "0/1,0/1,0/1") {
        Log.e(TAG, "¡Los metadatos se perdieron al guardar en MediaStore!")
      }
    }

    return if (finalUri != null) {
      Log.d(TAG, "Imagen guardada en MediaStore correctamente")
      Pair(finalBytes, location)
    } else {
      Log.e(TAG, "Error al guardar en MediaStore")
      null
    }
  }

  private fun createTempImageFile(prefix: String): File {
    val timeStamp = System.currentTimeMillis()
    return File(context.cacheDir, "${prefix}GEO_$timeStamp.jpg").apply { createNewFile() }
  }

  private suspend fun waitForFileReady(uri: Uri, maxWaitMs: Long = 5000): Boolean = withContext(Dispatchers.IO) {
    val resolver = context.contentResolver
    var lastSize = -1L
    val start = System.currentTimeMillis()
    while (System.currentTimeMillis() - start < maxWaitMs) {
      try {
        resolver.openInputStream(uri)?.use { stream ->
          val size = stream.available().toLong()
          if (size > 0 && size == lastSize) return@withContext true
          lastSize = size
        }
      } catch (_: Exception) { }
      delay(200)
    }
    false
  }

  private fun writeLocationToExifFile(file: File, location: UserLocation): Boolean {
    return try {
      val exif = ExifInterface(file.absolutePath)
      exif.setAttribute(ExifInterface.TAG_GPS_LATITUDE, convertToDMSRational(location.latitude))
      exif.setAttribute(ExifInterface.TAG_GPS_LONGITUDE, convertToDMSRational(location.longitude))
      exif.setAttribute(ExifInterface.TAG_GPS_LATITUDE_REF, if (location.latitude >= 0) "N" else "S")
      exif.setAttribute(ExifInterface.TAG_GPS_LONGITUDE_REF, if (location.longitude >= 0) "E" else "W")
      exif.saveAttributes()
      Log.d(TAG, "EXIF escrito en archivo temporal")
      true
    } catch (e: Exception) {
      Log.e(TAG, "Error escribiendo EXIF: ${e.message}")
      false
    }
  }

  private fun saveImageToMediaStore(imageBytes: ByteArray): Uri? {
    val values = ContentValues().apply {
      put(MediaStore.Images.Media.DISPLAY_NAME, "GEO_${System.currentTimeMillis()}.jpg")
      put(MediaStore.Images.Media.MIME_TYPE, "image/jpeg")
      put(MediaStore.Images.Media.RELATIVE_PATH, "Pictures/GeoTerra")
    }
    val resolver = context.contentResolver
    val uri = resolver.insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, values)
    uri?.let {
      resolver.openOutputStream(it)?.use { os -> os.write(imageBytes) }
    }

    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) {
      context.sendBroadcast(Intent(Intent.ACTION_MEDIA_SCANNER_SCAN_FILE, uri))
    }
    return uri
  }

  override suspend fun pickPhotoFromGallery(): ByteArray? = suspendCancellableCoroutine { cont ->
    onLaunchGallery?.invoke { uri ->
      if (uri == null) {
        if (cont.isActive) cont.resume(null)
        return@invoke
      }
      try {
        val bytes = context.contentResolver.openFileDescriptor(uri, "r")?.use { pfd ->
          ExifInterface(pfd.fileDescriptor)
          context.contentResolver.openInputStream(uri)?.use { it.readBytes() }
        }
        cont.resume(bytes)
      } catch (e: Exception) {
        if (cont.isActive) cont.resume(null)
      }
    } ?: run { if (cont.isActive) cont.resume(null) }
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
      resolver.openOutputStream(it)?.use { out ->
        bitmap.compress(Bitmap.CompressFormat.JPEG, 90, out)
      }
    }
  }

  override fun extractLocationFromCache(imageData: ByteArray): UserLocation? {
    return try {
      val inputStream = ByteArrayInputStream(imageData)
      val exif = ExifInterface(inputStream)
      val latAttr = exif.getAttribute(ExifInterface.TAG_GPS_LATITUDE)
      val lonAttr = exif.getAttribute(ExifInterface.TAG_GPS_LONGITUDE)
      val latRef = exif.getAttribute(ExifInterface.TAG_GPS_LATITUDE_REF)
      val lonRef = exif.getAttribute(ExifInterface.TAG_GPS_LONGITUDE_REF)
      Log.d(TAG, "Atributos EXIF - lat: $latAttr, lon: $lonAttr, latRef: $latRef, lonRef: $lonRef")
      val latLong = exif.latLong
      if (latLong != null) {
        UserLocation(latLong[0], latLong[1], 0f).also {
          Log.d(TAG, "Datos extraídos: ${it.latitude}, ${it.longitude}")
        }
      } else {
        Log.d(TAG, "No se encontraron metadatos GPS")
        null
      }
    } catch (e: Exception) {
      Log.e(TAG, "Error extrayendo EXIF: ${e.message}")
      null
    }
  }

  private fun convertToDMSRational(coord: Double): String {
    val absolute = Math.abs(coord)
    val degrees = absolute.toInt()
    val minutesFloat = (absolute - degrees) * 60
    val minutes = minutesFloat.toInt()
    val secondsFloat = (minutesFloat - minutes) * 60
    val seconds = (secondsFloat * 1000).toInt()
    return "$degrees/1,$minutes/1,$seconds/1000"
  }
}