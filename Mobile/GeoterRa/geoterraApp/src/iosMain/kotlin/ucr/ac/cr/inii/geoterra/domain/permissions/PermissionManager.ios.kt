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

actual class PermissionContext

actual class PermissionManager actual constructor(
	private val context: PermissionContext
) {

	private val locationManager = CLLocationManager()

	actual fun hasGalleryPermission(): Boolean {
		val status = PHPhotoLibrary.authorizationStatus()
		return status == PHAuthorizationStatusAuthorized || status == PHAuthorizationStatusLimited
	}

	actual suspend fun requestGalleryPermission(): Boolean =
		suspendCancellableCoroutine { continuation ->
			PHPhotoLibrary.requestAuthorization { status ->
				continuation.resume(
					status == PHAuthorizationStatusAuthorized || status == PHAuthorizationStatusLimited
				)
			}
		}

	actual fun hasLocationPermission(): Boolean {
		val status = locationManager.authorizationStatus
		return status == kCLAuthorizationStatusAuthorizedWhenInUse ||
				status == kCLAuthorizationStatusAuthorizedAlways
	}

	actual suspend fun requestLocationPermission(): Boolean =
		suspendCancellableCoroutine { continuation ->
			val status = locationManager.authorizationStatus

			if (status == kCLAuthorizationStatusNotDetermined) {
				val delegate = object : NSObject(), CLLocationManagerDelegateProtocol {
					override fun locationManager(
						manager: CLLocationManager,
						didChangeAuthorizationStatus: CLAuthorizationStatus
					) {
						if (didChangeAuthorizationStatus != kCLAuthorizationStatusNotDetermined) {
							val granted =
								didChangeAuthorizationStatus == kCLAuthorizationStatusAuthorizedWhenInUse ||
										didChangeAuthorizationStatus == kCLAuthorizationStatusAuthorizedAlways
							continuation.resume(granted)
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

	actual fun hasCameraPermission(): Boolean {
		val status = AVCaptureDevice.authorizationStatusForMediaType(AVMediaTypeVideo)
		return status == AVAuthorizationStatusAuthorized
	}

	actual suspend fun requestCameraPermission(): Boolean {
		val status = AVCaptureDevice.authorizationStatusForMediaType(AVMediaTypeVideo)
		return if (status == AVAuthorizationStatusNotDetermined) {
			suspendCancellableCoroutine { continuation ->
				AVCaptureDevice.requestAccessForMediaType(AVMediaTypeVideo) { granted ->
					continuation.resume(granted)
				}
			}
		} else {
			status == AVAuthorizationStatusAuthorized
		}
	}
}