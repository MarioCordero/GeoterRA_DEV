package com.inii.geoterra.development.managers

// Good practice - All required permissions-related imports
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

object GalleryPermissionManager {

  private const val GALLERY_PERMISSION_REQUEST_CODE = 2000

  // Determines correct permission based on Android version
  val requiredPermission: String
    get() = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      Manifest.permission.READ_MEDIA_IMAGES
    } else {
      Manifest.permission.READ_EXTERNAL_STORAGE
    }

  private var isInitialized: Boolean = false

  /**
   * Checks if the app has gallery permission.
   */
  fun hasGalleryPermission(context: Context): Boolean {
    return ContextCompat.checkSelfPermission(
      context,
      requiredPermission
    ) == PackageManager.PERMISSION_GRANTED
  }

  /**
   * Requests permission using an Activity context.
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
   * Requests permission using a Fragment.
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
   * Request permission explicitly from an Activity.
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
   * Request permission explicitly from a Fragment.
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
   * Handles the result of the permission request.
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
      Toast.makeText(context.applicationContext, "Gallery permission granted", Toast.LENGTH_SHORT).show()
      isInitialized = true
    } else {
      Toast.makeText(context.applicationContext, "Gallery permission denied", Toast.LENGTH_SHORT).show()
    }
  }

  /**
   * Returns whether gallery permission has been granted and initialized.
   */
  fun isInitialized(): Boolean = isInitialized
}
