import android.content.Context
import android.content.pm.PackageManager
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import android.widget.Toast

object GalleryManager {

  const val GALLERY_PERMISSION_REQUEST_CODE = 2000
  private var isInitialize = false

  fun initialize(context: Context) {
    if (!hasGalleryPermission(context)) {
      requestGalleryPermission(context)
    }
  }

  fun isInitialize() : Boolean {
    return isInitialize
  }

  private fun hasGalleryPermission(context: Context): Boolean {
    return ContextCompat.checkSelfPermission(context, android.Manifest.permission.READ_EXTERNAL_STORAGE) == PackageManager.PERMISSION_GRANTED
  }

  private fun requestGalleryPermission(context: Context) {
    ActivityCompat.requestPermissions(context as AppCompatActivity,
                                      arrayOf(android.Manifest.permission.READ_EXTERNAL_STORAGE),
                                      GALLERY_PERMISSION_REQUEST_CODE)
  }

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
