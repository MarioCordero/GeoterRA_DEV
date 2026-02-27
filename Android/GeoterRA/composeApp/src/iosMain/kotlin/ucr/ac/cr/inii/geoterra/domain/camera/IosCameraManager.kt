package ucr.ac.cr.inii.geoterra.domain.camera

// iosMain
import kotlinx.cinterop.ExperimentalForeignApi
import kotlinx.cinterop.addressOf
import kotlinx.cinterop.usePinned
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.withContext
import kotlinx.coroutines.withTimeout
import platform.CoreFoundation.CFDataRef
import platform.UIKit.*
import platform.Foundation.*
import platform.CoreLocation.*
import platform.ImageIO.CGImageSourceCopyPropertiesAtIndex
import platform.ImageIO.CGImageSourceCreateWithData
import platform.ImageIO.kCGImagePropertyGPSDictionary
import platform.ImageIO.kCGImagePropertyGPSLatitude
import platform.ImageIO.kCGImagePropertyGPSLatitudeRef
import platform.ImageIO.kCGImagePropertyGPSLongitude
import platform.ImageIO.kCGImagePropertyGPSLongitudeRef
import platform.Photos.PHAssetChangeRequest
import platform.Photos.PHAuthorizationStatusAuthorized
import platform.Photos.PHPhotoLibrary
import platform.darwin.NSObject
import platform.posix.memcpy
import ucr.ac.cr.inii.geoterra.data.model.local.UserLocation
import ucr.ac.cr.inii.geoterra.domain.location.LocationProvider
import kotlin.coroutines.resume
import kotlin.coroutines.suspendCoroutine

class IosCameraManager(
  private val locationProvider: LocationProvider // Inyectamos el provider para los metadatos
) : CameraManager {
  private fun saveImageToLibrary(image: UIImage, location: UserLocation?) {
    PHPhotoLibrary.sharedPhotoLibrary().performChanges({
      val request = PHAssetChangeRequest.creationRequestForAssetFromImage(image)
      location?.let {
        request.location = CLLocation(latitude = it.latitude, longitude = it.longitude)
      }
    }, completionHandler = { success, error ->
      if (!success) println("Error Geoterra (Gallery): ${error?.localizedDescription}")
    })
  }

  @OptIn(ExperimentalForeignApi::class)
  override suspend fun takePhotoWithLocation(): Pair<ByteArray, UserLocation?>? {
    val rootController = UIApplication.sharedApplication.keyWindow?.rootViewController ?: return null

    // 1. Obtenemos la ubicación actual del flujo justo antes de disparar
    // Usamos withTimeout para no quedar bloqueados si no hay señal GPS
    val currentLocation = withContext(Dispatchers.Default) {
      try {
        withTimeout(2000) { locationProvider.observeLocation().firstOrNull() }
      } catch (e: Exception) { null }
    }

    return suspendCoroutine { continuation ->
      val imagePicker = UIImagePickerController().apply {
        sourceType = UIImagePickerControllerSourceType.UIImagePickerControllerSourceTypeCamera
        delegate = object : NSObject(), UIImagePickerControllerDelegateProtocol, UINavigationControllerDelegateProtocol {

          override fun imagePickerController(
            picker: UIImagePickerController,
            didFinishPickingMediaWithInfo: Map<Any?, *>
          ) {
            val image = didFinishPickingMediaWithInfo[UIImagePickerControllerOriginalImage] as? UIImage

            if (image != null) {
              // 2. Guardar en la galería con la ubicación obtenida
              saveImageToLibrary(image, currentLocation)

              // 3. Convertir a ByteArray para uso inmediato en la app
              val imageData = UIImageJPEGRepresentation(image, 0.8)
              val bytes = imageData?.toByteArray()

              picker.dismissViewControllerAnimated(true) {
                continuation.resume(if (bytes != null) Pair(bytes, currentLocation) else null)
              }
            } else {
              picker.dismissViewControllerAnimated(true) { continuation.resume(null) }
            }
          }

          override fun imagePickerControllerDidCancel(picker: UIImagePickerController) {
            picker.dismissViewControllerAnimated(true) { continuation.resume(null) }
          }
        }
      }
      rootController.presentViewController(imagePicker, animated = true, completion = null)
    }
  }

  @OptIn(ExperimentalForeignApi::class)
  override fun extractLocationFromCache(imageData: ByteArray): UserLocation? {
    val data = imageData.toNSData()
    val source = CGImageSourceCreateWithData(data as CFDataRef, null) ?: return null
    val metadata = CGImageSourceCopyPropertiesAtIndex(source, 0u, null) as? Map<Any?, *>
    val gps = metadata?.get(kCGImagePropertyGPSDictionary) as? Map<*, *> ?: return null

    val lat = gps[kCGImagePropertyGPSLatitude] as? Double
    val lon = gps[kCGImagePropertyGPSLongitude] as? Double
    val latRef = gps[kCGImagePropertyGPSLatitudeRef] as? String
    val lonRef = gps[kCGImagePropertyGPSLongitudeRef] as? String

    if (lat != null && lon != null) {
      val finalLat = if (latRef == "S") -lat else lat
      val finalLon = if (lonRef == "W") -lon else lon
      return UserLocation(
        latitude = finalLat, longitude = finalLon,
        accuracy = 0f
      )
    }
    return null
  }
}

// Helpers útiles para conversión
@OptIn(ExperimentalForeignApi::class)
fun NSData.toByteArray(): ByteArray = ByteArray(length.toInt()).apply {
  usePinned { memcpy(it.addressOf(0), bytes, length) }
}

@OptIn(ExperimentalForeignApi::class)
fun ByteArray.toNSData(): NSData = usePinned {
  NSData.dataWithBytes(it.addressOf(0), size.toULong())
}