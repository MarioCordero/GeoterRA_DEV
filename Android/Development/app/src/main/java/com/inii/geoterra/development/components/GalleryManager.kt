package com.inii.geoterra.development.components

import android.content.Context
import android.content.pm.PackageManager
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import android.widget.Toast

/**
 * Gallery manager
 *
 * @constructor Create empty Galler y manager
 */
object GalleryManager {

  private const val GALLERY_PERMISSION_REQUEST_CODE = 1000
  private var isInitialize = false

  /**
   * Initialize
   *
   * @param context
   */
  fun initialize(context: Context) {
    if (!hasGalleryPermission(context)) {
      requestGalleryPermission(context)
    }
  }

  /**
   * Is initialize
   *
   * @return
   */
  fun isInitialize() : Boolean {
    return isInitialize
  }

  /**
   * Has gallery permission
   *
   * @param context
   * @return
   */
  private fun hasGalleryPermission(context: Context): Boolean {
    return ContextCompat.checkSelfPermission(context, android.Manifest.permission.READ_EXTERNAL_STORAGE) == PackageManager.PERMISSION_GRANTED
  }

  /**
   * Request gallery permission
   *
   * @param context
   */
  private fun requestGalleryPermission(context: Context) {
    ActivityCompat.requestPermissions(context as AppCompatActivity,
                                      arrayOf(android.Manifest.permission.READ_EXTERNAL_STORAGE),
                                      GALLERY_PERMISSION_REQUEST_CODE
    )
  }

  /**
   * Handle permission result
   *
   * @param requestCode
   * @param grantResults
   * @param context
   */
  fun handlePermissionResult(requestCode: Int, grantResults: IntArray, context: Context) {
    if (requestCode == GALLERY_PERMISSION_REQUEST_CODE) {
      if (grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
        Toast.makeText(context, "Permiso de galería concedido", Toast.LENGTH_SHORT).show()
      } else {
        Toast.makeText(context, "Permiso de galería denegado", Toast.LENGTH_SHORT).show()
      }
    }
  }
}
