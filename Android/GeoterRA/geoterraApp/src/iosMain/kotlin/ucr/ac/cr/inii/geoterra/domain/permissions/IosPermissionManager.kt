package ucr.ac.cr.inii.geoterra.domain.permissions

import platform.CoreLocation.*
import platform.darwin.NSObject
import kotlin.coroutines.resume
import kotlinx.coroutines.suspendCancellableCoroutine
import platform.AVFoundation.AVAuthorizationStatusAuthorized
import platform.AVFoundation.AVAuthorizationStatusNotDetermined
import platform.AVFoundation.AVCaptureDevice
import platform.AVFoundation.AVMediaTypeVideo
import platform.AVFoundation.authorizationStatusForMediaType
import platform.AVFoundation.requestAccessForMediaType
import kotlin.coroutines.suspendCoroutine
import platform.Photos.*

class IosPermissionManager : PermissionManager {

  private val locationManager = CLLocationManager()
  
  override fun hasGalleryPermission(): Boolean {
    val status = PHPhotoLibrary.authorizationStatus()
    return status == PHAuthorizationStatusAuthorized || status == PHAuthorizationStatusLimited
  }
  
  override suspend fun requestGalleryPermission(): Boolean = suspendCoroutine { continuation ->
    PHPhotoLibrary.requestAuthorization { status ->
      continuation.resume(status == PHAuthorizationStatusAuthorized || status == PHAuthorizationStatusLimited)
    }
  }

  override fun hasLocationPermission(): Boolean {
    val status = locationManager.authorizationStatus
    return status == kCLAuthorizationStatusAuthorizedWhenInUse ||
      status == kCLAuthorizationStatusAuthorizedAlways
  }

  override suspend fun requestLocationPermission(): Boolean = suspendCancellableCoroutine { continuation ->
    val status = locationManager.authorizationStatus

    if (status == kCLAuthorizationStatusNotDetermined) {
      val delegate = object : NSObject(), CLLocationManagerDelegateProtocol {
        override fun locationManager(manager: CLLocationManager, didChangeAuthorizationStatus: CLAuthorizationStatus) {
          if (didChangeAuthorizationStatus != kCLAuthorizationStatusNotDetermined) {
            val granted = didChangeAuthorizationStatus == kCLAuthorizationStatusAuthorizedWhenInUse ||
              didChangeAuthorizationStatus == kCLAuthorizationStatusAuthorizedAlways
            continuation.resume(granted)
            // Limpiamos el delegado para evitar fugas de memoria
            locationManager.delegate = null
          }
        }
      }
      locationManager.delegate = delegate
      locationManager.requestWhenInUseAuthorization()
    } else {
      continuation.resume(hasLocationPermission())
    }
  }

  override fun hasCameraPermission(): Boolean {
    val status = AVCaptureDevice.authorizationStatusForMediaType(AVMediaTypeVideo)
    return status == AVAuthorizationStatusAuthorized
  }

  override suspend fun requestCameraPermission(): Boolean {
    val status = AVCaptureDevice.authorizationStatusForMediaType(AVMediaTypeVideo)
    return if (status == AVAuthorizationStatusNotDetermined) {
      suspendCoroutine { continuation ->
        AVCaptureDevice.requestAccessForMediaType(AVMediaTypeVideo) { granted ->
          continuation.resume(granted)
        }
      }
    } else {
      status == AVAuthorizationStatusAuthorized
    }
  }
}