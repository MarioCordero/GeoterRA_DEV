package ucr.ac.cr.inii.geoterra

import android.graphics.Bitmap
import android.net.Uri
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.runtime.Composable
import org.koin.core.context.loadKoinModules
import org.koin.dsl.module
import org.koin.mp.KoinPlatform.getKoin
import ucr.ac.cr.inii.geoterra.core.di.initKoin
import ucr.ac.cr.inii.geoterra.domain.camera.AndroidCameraManager
import ucr.ac.cr.inii.geoterra.domain.camera.CameraManager
import ucr.ac.cr.inii.geoterra.domain.permissions.AndroidPermissionManager
import ucr.ac.cr.inii.geoterra.domain.permissions.PermissionManager

@Suppress("DEPRECATION") class MainActivity : ComponentActivity() {
  
  private lateinit var permissionManager: AndroidPermissionManager
  private lateinit var cameraManager: AndroidCameraManager
  private var cameraResultCallback: ((Boolean) -> Unit)? = null
  private var galleryCallback: ((Uri?) -> Unit)? = null
  
  private val takePhotoLauncher = registerForActivityResult(
    ActivityResultContracts.TakePicture()
  ) { success ->
    cameraManager.onCameraResult(success)
  }
  
  private val pickPhotoLauncher = registerForActivityResult(
    ActivityResultContracts.GetContent()
  ) { uri ->
    galleryCallback?.invoke(uri)
  }
  
  override fun onCreate(savedInstanceState: Bundle?) {
    enableEdgeToEdge()
    super.onCreate(savedInstanceState)
    
    permissionManager = AndroidPermissionManager(this)
    cameraManager = AndroidCameraManager(this)
    
    loadKoinModules(
      module {
        factory<PermissionManager> { permissionManager }
        factory<CameraManager> { cameraManager }
      }
    )
    
    cameraManager.onLaunchCamera = { uri ->
      takePhotoLauncher.launch(uri)
    }
    
    cameraManager.onLaunchGallery = { callback ->
      this.galleryCallback = callback
      pickPhotoLauncher.launch("image/*")
    }
    
    setContent {
      App()
    }
  }
}

@Composable
fun AppAndroidPreview() {
  App()
}