package ucr.ac.cr.inii.geoterra

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.Composable
import org.koin.core.context.loadKoinModules
import org.koin.dsl.module
import org.koin.mp.KoinPlatform.getKoin
import ucr.ac.cr.inii.geoterra.domain.permissions.AndroidPermissionManager
import ucr.ac.cr.inii.geoterra.domain.permissions.PermissionManager

@Suppress("DEPRECATION") class MainActivity : ComponentActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    enableEdgeToEdge()
    super.onCreate(savedInstanceState)
    
    val activityModule = module {
      
      factory<PermissionManager> {
        AndroidPermissionManager(this@MainActivity)
      }
    }
    
    loadKoinModules(activityModule)
    
    setContent {
      App()
    }
  }
  
  @Deprecated("This method has been deprecated in favor of using the Activity Result API\n      which brings increased type safety via an {@link ActivityResultContract} and the prebuilt\n      contracts for common intents available in\n      {@link androidx.activity.result.contract.ActivityResultContracts}, provides hooks for\n      testing, and allow receiving results in separate, testable classes independent from your\n      activity. Use\n      {@link #registerForActivityResult(ActivityResultContract, ActivityResultCallback)} passing\n      in a {@link RequestMultiplePermissions} object for the {@link ActivityResultContract} and\n      handling the result in the {@link ActivityResultCallback#onActivityResult(Object) callback}.")
  override fun onRequestPermissionsResult(
    requestCode: Int,
    permissions: Array<String>,
    grantResults: IntArray
  ) {
    super.onRequestPermissionsResult(requestCode, permissions, grantResults)
    val permissionManager = getKoin().get<PermissionManager>()
    if (permissionManager is AndroidPermissionManager) {
      permissionManager.onRequestPermissionsResult(
        requestCode,
        permissions,
        grantResults
      )
    }
  }
}

@Composable
fun AppAndroidPreview() {
  App()
}