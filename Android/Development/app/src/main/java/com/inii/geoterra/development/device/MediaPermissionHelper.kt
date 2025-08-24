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
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.inii.geoterra.development.interfaces.PermissionRequester
import javax.inject.Inject
import javax.inject.Singleton


/**
 * @class MediaPermissionHelper
 * @brief Manages gallery permission requests and handling for the application.
 *
 * This singleton class simplifies the process of requesting and checking gallery permissions,
 * adapting to different Android versions (TIRAMISU and above use READ_MEDIA_IMAGES,
 * older versions use READ_EXTERNAL_STORAGE).
 *
 * It utilizes a [PermissionRequester] interface to delegate the actual permission request
 * and rationale display to the calling component (e.g., an Activity or
 * Fragment).
 *
 * @property galleryPermissionRequestCode A constant integer used for identifying the gallery permission request.
 * @property requiredPermission A private property that dynamically returns the correct storage permission string
 *                              based on the device's Android version.
 * @property isInitialized A private boolean flag to track whether the permission flow has been
 *                         initialized and the permission is granted.
 */
@Singleton
class MediaPermissionHelper @Inject constructor() {
  /**
   * Request code for requesting gallery permission.
   * This constant is used when requesting permission to access the device's gallery.
   */
  private val galleryPermissionRequestCode = 2000

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

  /**
   * Initializes the permission handling process for accessing the device's gallery.
   *
   * @param permissionRequester An instance of [PermissionRequester] responsible for
   *                            handling the permission request lifecycle (e.g., an Activity or Fragment).
   *                            It provides context, checks for rationale, and initiates the permission request.
   */
  fun initialize(permissionRequester: PermissionRequester) {
    val context = permissionRequester.getContext()

    // Si ya tiene el permiso, marcamos como inicializado
    if (hasGalleryPermission(context)) {
      isInitialized = true
      return
    }

    // Verificamos si se debe mostrar el racional de permiso
    val shouldShowRationaleDialog = permissionRequester.shouldShowRationale(requiredPermission)

    if (shouldShowRationaleDialog) {
      // Mostrar diálogo de explicación antes de solicitar permiso
      showRationaleDialog(context)
    }

    // Solicitar el permiso a través de la interfaz
    permissionRequester.requestPermission(arrayOf(requiredPermission), galleryPermissionRequestCode)
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

    if (requestCode == galleryPermissionRequestCode) {
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
