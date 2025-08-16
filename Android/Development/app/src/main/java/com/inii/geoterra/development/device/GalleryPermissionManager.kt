package com.inii.geoterra.development.device

import android.Manifest
import android.app.Activity
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.provider.Settings
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import com.inii.geoterra.development.interfaces.PermissionRequester
import javax.inject.Inject
import javax.inject.Singleton

/**
 * @brief Manager for handling gallery access permissions across Android versions
 *
 * Centralizes permission management for media storage access with backward compatibility.
 * Handles both Activity and Fragment based permission requests.
 */
@Singleton
class GalleryPermissionManager @Inject constructor() {
  private val GALLERY_PERMISSION_REQUEST_CODE = 2000

  /**
   * @brief Dynamic permission requirement based on Android version
   * @return Appropriate storage permission string for current API level
   */
  private val requiredPermission: String
    get() = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      Manifest.permission.READ_MEDIA_IMAGES
    } else {
      Manifest.permission.READ_EXTERNAL_STORAGE
    }

  /** @brief Track initialization state of permission handling */
  private var isInitialized: Boolean = false

  /**
   * @brief Checks current gallery permission status
   * @param context Context for permission verification
   * @return Boolean indicating permission grant status
   */
  private fun hasGalleryPermission(context: Context): Boolean {
    return ContextCompat.checkSelfPermission(
      context,
      requiredPermission
    ) == PackageManager.PERMISSION_GRANTED
  }

  fun initialize(permissionRequester: PermissionRequester) {
    val context = permissionRequester.getContext()

    // Si ya tiene el permiso, marcamos como inicializado
    if (hasGalleryPermission(context)) {
      isInitialized = true
      return
    }

    // Verificamos si se debe mostrar el racional de permiso
    val showRationale = permissionRequester.shouldShowRationale(requiredPermission)

    if (showRationale) {
      // Mostrar diálogo de explicación antes de solicitar permiso
      showRationaleDialog(context)
    }

    // Solicitar el permiso a través de la interfaz
    permissionRequester.requestPermission(arrayOf(requiredPermission), GALLERY_PERMISSION_REQUEST_CODE)
  }


  /**
   * @brief Processes permission request results
   * @param requestCode Code from permission request
   * @param grantResults Array of permission grant outcomes
   * @param permissionRequester Object implementing PermissionRequester interface
   */
  fun handlePermissionResult(
    requestCode: Int,
    grantResults: IntArray,
    permissionRequester: PermissionRequester
  ) {
    val context = permissionRequester.getContext()

    if (requestCode == GALLERY_PERMISSION_REQUEST_CODE) {
      if (grantResults.isNotEmpty() &&
        grantResults[0] == PackageManager.PERMISSION_GRANTED
      ) {
        Toast.makeText(
          context.applicationContext,
          "Gallery permission granted",
          Toast.LENGTH_SHORT
        ).show()
        isInitialized = true
      } else {
        Toast.makeText(
          context.applicationContext,
          "Gallery permission denied",
          Toast.LENGTH_SHORT
        ).show()
        val shouldShowRationale = ActivityCompat.shouldShowRequestPermissionRationale(
          context as Activity, requiredPermission
        )
        if (!shouldShowRationale) {
          showSettingsRedirectDialog(context)
        }
      }
    }
  }

  /**
   * @brief Shows a dialog explaining why gallery permissions are needed.
   */
  private fun showRationaleDialog(context : Context) {
    AlertDialog.Builder(context)
      .setTitle("Gallery Permission Required")
      .setMessage("This app needs access to your gallery to select images. Please grant the permission.")
      .setNegativeButton("Cancel", null)
      .show()
  }

  /**
   * @brief Shows a dialog redirecting the user to app settings if permission is permanently denied.
   */
  private fun showSettingsRedirectDialog(context: Context) {
    AlertDialog.Builder(context)
      .setTitle("Permission Denied")
      .setMessage("You have permanently denied gallery permission. Please enable it manually in Settings.")
      .setPositiveButton("Open Settings") { _, _ ->
        val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
          data = Uri.fromParts("package", context.packageName, null)
        }
        context.startActivity(intent)
      }
      .setNegativeButton("Cancel", null)
      .show()
  }

  /**
   * @brief Checks initialization and permission status
   * @return Boolean indicating combined permission and initialization state
   */
  fun isInitialized(): Boolean = isInitialized
}
