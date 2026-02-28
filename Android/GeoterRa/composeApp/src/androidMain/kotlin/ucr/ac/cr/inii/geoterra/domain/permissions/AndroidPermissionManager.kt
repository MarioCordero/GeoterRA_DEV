package ucr.ac.cr.inii.geoterra.domain.permissions

import android.Manifest
import android.app.Activity
import android.content.pm.PackageManager
import androidx.activity.ComponentActivity
import androidx.activity.result.ActivityResultLauncher
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import kotlinx.coroutines.CancellableContinuation
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlin.coroutines.resume

class AndroidPermissionManager(
  private val activity: ComponentActivity
) : PermissionManager {
  
  private var locationLauncher: ActivityResultLauncher<String>? = null
  private var cameraLauncher: ActivityResultLauncher<String>? = null
  
  private var locationContinuation: ((Boolean) -> Unit)? = null
  private var cameraContinuation: ((Boolean) -> Unit)? = null
  
  private var galleryLauncher: ActivityResultLauncher<String>? = null
  private var galleryContinuation: ((Boolean) -> Unit)? = null
  
  init {
    locationLauncher = activity.registerForActivityResult(ActivityResultContracts.RequestPermission()) { isGranted ->
      locationContinuation?.invoke(isGranted)
      locationContinuation = null
    }
    
    cameraLauncher = activity.registerForActivityResult(ActivityResultContracts.RequestPermission()) { isGranted ->
      cameraContinuation?.invoke(isGranted)
      cameraContinuation = null
    }
    
    galleryLauncher = activity.registerForActivityResult(ActivityResultContracts.RequestPermission()) {
      galleryContinuation?.invoke(it)
      galleryContinuation = null
    }
  }
  
  override fun hasGalleryPermission(): Boolean {
    return if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.Q) {
      true // Scoped storage allows saving without permission
    } else {
      ContextCompat.checkSelfPermission(activity, Manifest.permission.WRITE_EXTERNAL_STORAGE) == PackageManager.PERMISSION_GRANTED
    }
  }
  
  override suspend fun requestGalleryPermission(): Boolean = suspendCancellableCoroutine { cont ->
    if (hasGalleryPermission()) {
      cont.resume(true)
    } else {
      galleryContinuation = { cont.resume(it) }
      galleryLauncher?.launch(Manifest.permission.WRITE_EXTERNAL_STORAGE)
    }
  }
  
  override fun hasLocationPermission(): Boolean =
    checkPermission(Manifest.permission.ACCESS_FINE_LOCATION)
  
  override fun hasCameraPermission(): Boolean =
    checkPermission(Manifest.permission.CAMERA)
  
  override suspend fun requestLocationPermission(): Boolean = suspendCancellableCoroutine { cont ->
    locationContinuation = { cont.resume(it) }
    locationLauncher?.launch(Manifest.permission.ACCESS_FINE_LOCATION)
  }
  
  override suspend fun requestCameraPermission(): Boolean = suspendCancellableCoroutine { cont ->
    cameraContinuation = { cont.resume(it) }
    cameraLauncher?.launch(Manifest.permission.CAMERA)
  }
  
  private fun checkPermission(permission: String): Boolean {
    return ContextCompat.checkSelfPermission(
      activity,
      permission
    ) == PackageManager.PERMISSION_GRANTED
  }
  
//  }
//
//  override fun hasLocationPermission(): Boolean {
//    return ContextCompat.checkSelfPermission(
//      activity,
//      Manifest.permission.ACCESS_FINE_LOCATION
//    ) == PackageManager.PERMISSION_GRANTED
//  }
//
//  override suspend fun requestLocationPermission(): Boolean =
//    suspendCancellableCoroutine { cont ->
//      continuation = cont
//
//      ActivityCompat.requestPermissions(
//        activity,
//        arrayOf(Manifest.permission.ACCESS_FINE_LOCATION),
//        REQUEST_CODE_LOCATION
//      )
//    }
//
//  fun onRequestPermissionsResult(
//    requestCode: Int,
//    permissions: Array<out String>,
//    grantResults: IntArray
//  ) {
//    if (requestCode == REQUEST_CODE_LOCATION) {
//
//      val granted = grantResults.isNotEmpty() &&
//        grantResults[0] == PackageManager.PERMISSION_GRANTED
//
//      println("Permiso de ubicación: $granted")
//
//      continuation?.resume(granted)
//      continuation = null
//    }
//  }
}