package ucr.ac.cr.inii.geoterra.domain.permissions

import android.Manifest
import android.content.pm.PackageManager
import androidx.activity.ComponentActivity
import androidx.activity.result.ActivityResultLauncher
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlin.coroutines.resume

actual typealias PermissionContext = ComponentActivity

actual class PermissionManager actual constructor(
    private val context: PermissionContext
) {

    private var locationLauncher: ActivityResultLauncher<String>? = null
    private var cameraLauncher: ActivityResultLauncher<String>? = null
    private var galleryLauncher: ActivityResultLauncher<String>? = null

    private var locationContinuation: ((Boolean) -> Unit)? = null
    private var cameraContinuation: ((Boolean) -> Unit)? = null
    private var galleryContinuation: ((Boolean) -> Unit)? = null

    init {
        locationLauncher = context.registerForActivityResult(ActivityResultContracts.RequestPermission()) { isGranted ->
            locationContinuation?.invoke(isGranted)
            locationContinuation = null
        }

        cameraLauncher = context.registerForActivityResult(ActivityResultContracts.RequestPermission()) { isGranted ->
            cameraContinuation?.invoke(isGranted)
            cameraContinuation = null
        }

        galleryLauncher = context.registerForActivityResult(ActivityResultContracts.RequestPermission()) { isGranted ->
            galleryContinuation?.invoke(isGranted)
            galleryContinuation = null
        }
    }

    actual fun hasGalleryPermission(): Boolean {
        return if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.Q) {
            true
        } else {
            ContextCompat.checkSelfPermission(context, Manifest.permission.WRITE_EXTERNAL_STORAGE) == PackageManager.PERMISSION_GRANTED
        }
    }

    actual suspend fun requestGalleryPermission(): Boolean = suspendCancellableCoroutine { cont ->
        if (hasGalleryPermission()) {
            cont.resume(true)
        } else {
            galleryContinuation = { cont.resume(it) }
            galleryLauncher?.launch(Manifest.permission.WRITE_EXTERNAL_STORAGE)
        }
    }

    actual fun hasLocationPermission(): Boolean =
        checkPermission(Manifest.permission.ACCESS_FINE_LOCATION)

    actual fun hasCameraPermission(): Boolean =
        checkPermission(Manifest.permission.CAMERA)

    actual suspend fun requestLocationPermission(): Boolean = suspendCancellableCoroutine { cont ->
        if (hasLocationPermission()) {
            cont.resume(true)
        } else {
            locationContinuation = { cont.resume(it) }
            locationLauncher?.launch(Manifest.permission.ACCESS_FINE_LOCATION)
        }
    }

    actual suspend fun requestCameraPermission(): Boolean = suspendCancellableCoroutine { cont ->
        if (hasCameraPermission()) {
            cont.resume(true)
        } else {
            cameraContinuation = { cont.resume(it) }
            cameraLauncher?.launch(Manifest.permission.CAMERA)
        }
    }

    private fun checkPermission(permission: String): Boolean {
        return ContextCompat.checkSelfPermission(
            context,
            permission
        ) == PackageManager.PERMISSION_GRANTED
    }
}