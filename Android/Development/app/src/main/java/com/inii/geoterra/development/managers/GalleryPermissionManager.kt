package com.inii.geoterra.development.managers

import android.Manifest
import android.app.Activity
import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import android.util.Log
import android.widget.Toast
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment

/**
 * Manages gallery permission requests and state validation.
 *
 * This class encapsulates the logic for checking and requesting
 * access to gallery/media-related content, adapting to Android 13+ permission changes.
 *
 * @constructor Creates an instance bound to a Context for permission operations.
 */
class GalleryPermissionManager(private val context: Context) {

  companion object {
    private const val GALLERY_PERMISSION_REQUEST_CODE = 2000

    /**
     * Determines which permission string should be used
     * depending on the current Android version.
     */
    private val requiredPermission: String
      // Get the correct permission string based on the Android version.
      get() = when {
        Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU ->
          Manifest.permission.READ_MEDIA_IMAGES
        else ->
          Manifest.permission.READ_EXTERNAL_STORAGE
      }
  }
  // Flag indicating whether gallery access has been initialized.
  private var isInitialized: Boolean = false

  /**
   * Returns whether the gallery permission has been granted.
   */
  private fun hasGalleryPermission(): Boolean {
    return ContextCompat.checkSelfPermission(
      context,
      requiredPermission
    ) == PackageManager.PERMISSION_GRANTED
  }

  /**
   * Initialize the gallery permission check and request.
   *
   * @param activity The activity to request permissions.
   */
  fun initialize(activity: Activity) {
    if (hasGalleryPermission()) {
      isInitialized = true
    } else {
      activity.requestPermissions(arrayOf(requiredPermission), GALLERY_PERMISSION_REQUEST_CODE)
    }
  }

  fun initialize(fragment: Fragment) {
    if (hasGalleryPermission()) {
      isInitialized = true
    } else {
      fragment.requestPermissions(arrayOf(requiredPermission), GALLERY_PERMISSION_REQUEST_CODE)
    }
  }

  fun requestGalleryPermission(fragment: Fragment) {
    if (!hasGalleryPermission()) {
      fragment.requestPermissions(arrayOf(requiredPermission), GALLERY_PERMISSION_REQUEST_CODE)
    } else {
      isInitialized = true
    }
  }

  /**
   * Requests gallery permission from the user if not already granted.
   *
   * @param activity An instance of [Activity] from which to launch the permission request dialog.
   */
  fun requestGalleryPermission(activity: Activity) {
    if (!hasGalleryPermission()) {
      ActivityCompat.requestPermissions(
        activity,
        arrayOf(requiredPermission),
        GALLERY_PERMISSION_REQUEST_CODE
      )
    } else {
      this.isInitialized = true
    }
  }

  /**
   * Processes the result of a permission request and reacts accordingly.
   *
   * @param requestCode The request code received in the permission callback.
   * @param grantResults The result array received from the permission callback.
   */
  fun handlePermissionResult(requestCode: Int, grantResults: IntArray) {
    if (requestCode != GALLERY_PERMISSION_REQUEST_CODE) return
    Log.i("GalleryManager", "handlePermissionResult $grantResults")
    if (grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
      Toast.makeText(context, "Gallery permission granted", Toast.LENGTH_SHORT).show()
      isInitialized = true
    } else {
      Toast.makeText(context, "Gallery permission denied", Toast.LENGTH_SHORT).show()
    }
  }

  /**
   * Indicates whether gallery access was successfully initialized.
   * Should be used to guard access to gallery-dependent features.
   */
  fun isInitialized() : Boolean = isInitialized
}
