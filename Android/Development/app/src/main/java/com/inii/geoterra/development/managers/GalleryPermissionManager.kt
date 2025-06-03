package com.inii.geoterra.development.managers

import android.Manifest
import android.app.Activity
import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import android.widget.Toast
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment

/**
 * @brief Manager for handling gallery access permissions across Android versions
 *
 * Centralizes permission management for media storage access with backward compatibility.
 * Handles both Activity and Fragment based permission requests.
 */
object GalleryPermissionManager {
  /** @brief Unique request code identifier for gallery permission requests */
  private const val GALLERY_PERMISSION_REQUEST_CODE = 2000

  /**
   * @brief Dynamic permission requirement based on Android version
   * @return Appropriate storage permission string for current API level
   */
  val requiredPermission : String
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
   * @brief Initializes permission flow from Activity context
   * @param activity Host activity for permission request
   */
  fun initialize(activity: Activity) {
    if (hasGalleryPermission(activity)) {
      isInitialized = true
    } else {
      ActivityCompat.requestPermissions(
        activity,
        arrayOf(requiredPermission),
        GALLERY_PERMISSION_REQUEST_CODE
      )
    }
  }

  /**
   * @brief Initializes permission flow from Fragment context
   * @param fragment Host fragment for permission request
   */
  fun initialize(fragment: Fragment) {
    if (hasGalleryPermission(fragment.requireContext())) {
      isInitialized = true
    } else {
      fragment.requestPermissions(
        arrayOf(requiredPermission),
        GALLERY_PERMISSION_REQUEST_CODE
      )
    }
  }

  /**
   * @brief Explicit permission request from Activity
   * @param activity Target activity for permission dialog
   */
  fun requestGalleryPermission(activity: Activity) {
    if (!hasGalleryPermission(activity)) {
      ActivityCompat.requestPermissions(
        activity,
        arrayOf(requiredPermission),
        GALLERY_PERMISSION_REQUEST_CODE
      )
    } else {
      isInitialized = true
    }
  }

  /**
   * @brief Explicit permission request from Fragment
   * @param fragment Target fragment for permission dialog
   */
  fun requestGalleryPermission(fragment: Fragment) {
    if (!hasGalleryPermission(fragment.requireContext())) {
      fragment.requestPermissions(
        arrayOf(requiredPermission),
        GALLERY_PERMISSION_REQUEST_CODE
      )
    } else {
      isInitialized = true
    }
  }

  /**
   * @brief Processes permission request results
   * @param requestCode Code from permission request
   * @param grantResults Array of permission grant outcomes
   * @param context Context for UI feedback
   */
  fun handlePermissionResult(
    requestCode: Int,
    grantResults: IntArray,
    context: Context
  ) {
    if (requestCode != GALLERY_PERMISSION_REQUEST_CODE) return

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
    }
  }

  /**
   * @brief Checks initialization and permission status
   * @return Boolean indicating combined permission and initialization state
   */
  fun isInitialized(): Boolean = isInitialized
}
