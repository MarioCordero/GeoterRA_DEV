package ucr.ac.cr.inii.geoterra.domain.camera

// iosMain
import kotlinx.cinterop.ExperimentalForeignApi
import kotlinx.cinterop.addressOf
import kotlinx.cinterop.refTo
import kotlinx.cinterop.reinterpret
import kotlinx.cinterop.usePinned
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.coroutines.withContext
import kotlinx.coroutines.withTimeout
import platform.CoreFoundation.CFDataCreate
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
import platform.Photos.PHAsset
import platform.Photos.PHAssetChangeRequest
import platform.Photos.PHAuthorizationStatusAuthorized
import platform.Photos.PHContentEditingInputRequestOptions
import platform.Photos.PHImageManager
import platform.Photos.PHImageRequestOptions
import platform.Photos.PHPhotoLibrary
import platform.Photos.requestContentEditingInputWithOptions
import platform.PhotosUI.PHPickerConfiguration
import platform.PhotosUI.PHPickerFilter
import platform.PhotosUI.PHPickerResult
import platform.PhotosUI.PHPickerViewController
import platform.PhotosUI.PHPickerViewControllerDelegateProtocol
import platform.darwin.NSObject
import platform.darwin.dispatch_async
import platform.darwin.dispatch_get_main_queue
import platform.posix.memcpy
import ucr.ac.cr.inii.geoterra.data.model.local.UserLocation
import ucr.ac.cr.inii.geoterra.domain.location.LocationProvider
import kotlin.coroutines.resume
import kotlin.coroutines.suspendCoroutine

class IosCameraManager(
) : CameraManager {

  @OptIn(ExperimentalForeignApi::class)
  private fun saveImageToLibrary(image: UIImage, location: UserLocation?) {
    PHPhotoLibrary.sharedPhotoLibrary().performChanges({
      val request = PHAssetChangeRequest.creationRequestForAssetFromImage(image)
      location?.let {
        request.location = CLLocation(
          coordinate = CLLocationCoordinate2DMake(it.latitude, it.longitude),
          altitude = 0.0,
          horizontalAccuracy = it.accuracy.toDouble(),
          verticalAccuracy = -1.0,
          timestamp = NSDate()
        )
      }
    }, completionHandler = { success, error ->
      if (!success) println("iOS Gallery Error: ${error?.localizedDescription}")
    }
    )
  }

  override suspend fun takePhotoWithLocation(location: UserLocation): Pair<ByteArray, UserLocation?>? {
    val root = UIApplication.sharedApplication.keyWindow?.rootViewController ?: return null


    return suspendCoroutine { continuation ->
      val picker = UIImagePickerController().apply {
        sourceType = UIImagePickerControllerSourceType.UIImagePickerControllerSourceTypeCamera
        delegate = object : NSObject(), UIImagePickerControllerDelegateProtocol,
          UINavigationControllerDelegateProtocol {
          override fun imagePickerController(
            picker: UIImagePickerController,
            didFinishPickingMediaWithInfo: Map<Any?, *>
          ) {
            val image =
              didFinishPickingMediaWithInfo[UIImagePickerControllerOriginalImage] as? UIImage

            picker.dismissViewControllerAnimated(true) {
              if (image != null) {
                saveImageToLibrary(image, location)
                val data = UIImageJPEGRepresentation(image, 0.8)
                continuation.resume(Pair(data!!.toByteArray(), location))
              } else {
                continuation.resume(null)
              }
            }
          }

          override fun imagePickerControllerDidCancel(picker: UIImagePickerController) {
            picker.dismissViewControllerAnimated(true) { continuation.resume(null) }
          }
        }
      }
      root.presentViewController(picker, animated = true, completion = null)
    }
  }

  @OptIn(ExperimentalForeignApi::class)
  override suspend fun pickPhotoFromGallery(): ByteArray? = suspendCancellableCoroutine { continuation ->
    val configuration = PHPickerConfiguration()
    configuration.filter = PHPickerFilter.imagesFilter
    configuration.selectionLimit = 1

    val picker = PHPickerViewController(configuration)

    val delegate = object : NSObject(), PHPickerViewControllerDelegateProtocol {

      override fun picker(picker: PHPickerViewController, didFinishPicking: List<*>) {
        picker.dismissViewControllerAnimated(true, null)

        val result = didFinishPicking.firstOrNull() as? PHPickerResult
        if (result == null) {
          if (continuation.isActive) continuation.resume(null)
          return
        }

        val assetId = result.assetIdentifier
        if (assetId == null) {
          if (continuation.isActive) continuation.resume(null)
          return
        }

        val assets = PHAsset.fetchAssetsWithLocalIdentifiers(listOf(assetId), null)
        val asset = assets.firstObject as? PHAsset

        if (asset == null) {
          if (continuation.isActive) continuation.resume(null)
          return
        }

        val options = PHContentEditingInputRequestOptions()
        val imageManager = PHImageManager.defaultManager()
        val requestOptions = PHImageRequestOptions()
        requestOptions.networkAccessAllowed = true
        requestOptions.synchronous = false

        imageManager.requestImageDataAndOrientationForAsset(
          asset,
          requestOptions
        ) { data, dataUTI, orientation, info ->

          val bytes = data?.let {
            val byteArray = ByteArray(it.length.toInt())
            memcpy(byteArray.refTo(0), it.bytes, it.length)
            byteArray
          }

          dispatch_async(dispatch_get_main_queue()) {
            if (continuation.isActive) {
              continuation.resume(bytes)
            }
          }
        }
      }
    }

    picker.delegate = delegate

    val root = UIApplication.sharedApplication.keyWindow?.rootViewController
    root?.presentViewController(picker, true, null)

    continuation.invokeOnCancellation {
      picker.dismissViewControllerAnimated(true, null)
    }
  }

  @OptIn(ExperimentalForeignApi::class)
  override fun extractLocationFromCache(
    imageData: ByteArray
  ): UserLocation? {

    val cfData = imageData.toCFData() ?: return null

    val source =
      CGImageSourceCreateWithData(cfData, null)
        ?: return null

    val metadata =
      CGImageSourceCopyPropertiesAtIndex(
        source,
        0u,
        null
      ) as? Map<Any?, *> ?: return null

    val gps =
      metadata[kCGImagePropertyGPSDictionary]
        as? Map<*, *> ?: return null

    val lat = gps[kCGImagePropertyGPSLatitude] as? Double
    val lon = gps[kCGImagePropertyGPSLongitude] as? Double
    val latRef = gps[kCGImagePropertyGPSLatitudeRef] as? String
    val lonRef = gps[kCGImagePropertyGPSLongitudeRef] as? String

    if (lat != null && lon != null) {

      val finalLat =
        if (latRef == "S") -lat else lat

      val finalLon =
        if (lonRef == "W") -lon else lon

      println(metadata)

      return UserLocation(
        latitude = finalLat,
        longitude = finalLon,
        accuracy = 0f
      )
    }

    return null
  }
}

@OptIn(ExperimentalForeignApi::class)
fun ByteArray.toCFData(): CFDataRef? {

  if (isEmpty()) return null

  return usePinned { pinned ->

    CFDataCreate(
      null,
      pinned.addressOf(0).reinterpret(),
      size.toLong()
    )

  }
}

@OptIn(ExperimentalForeignApi::class)
fun NSData.toByteArray(): ByteArray = ByteArray(length.toInt()).apply {
  usePinned { memcpy(it.addressOf(0), bytes, length) }
}

@OptIn(ExperimentalForeignApi::class)
fun ByteArray.toNSData(): NSData = usePinned {
  NSData.dataWithBytes(it.addressOf(0), size.toULong())
}