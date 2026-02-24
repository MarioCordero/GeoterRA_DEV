package ucr.ac.cr.inii.geoterra.domain.permissions

import android.Manifest
import android.app.Activity
import android.content.pm.PackageManager
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import kotlinx.coroutines.CancellableContinuation
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlin.coroutines.resume

class AndroidPermissionManager(
  private val activity: Activity
) : PermissionManager {
  
  private var continuation: CancellableContinuation<Boolean>? = null
  
  override fun hasLocationPermission(): Boolean {
    return ContextCompat.checkSelfPermission(
      activity,
      Manifest.permission.ACCESS_FINE_LOCATION
    ) == PackageManager.PERMISSION_GRANTED
  }
  
  override suspend fun requestLocationPermission(): Boolean =
    suspendCancellableCoroutine { cont ->
      continuation = cont
      
      ActivityCompat.requestPermissions(
        activity,
        arrayOf(Manifest.permission.ACCESS_FINE_LOCATION),
        REQUEST_CODE_LOCATION
      )
    }
  
  fun onRequestPermissionsResult(
    requestCode: Int,
    permissions: Array<out String>,
    grantResults: IntArray
  ) {
    if (requestCode == REQUEST_CODE_LOCATION) {
      
      val granted = grantResults.isNotEmpty() &&
        grantResults[0] == PackageManager.PERMISSION_GRANTED
      
      println("Permiso de ubicación: $granted")
      
      continuation?.resume(granted)
      continuation = null
    }
  }
  
  companion object {
    private const val REQUEST_CODE_LOCATION = 1001
  }
}