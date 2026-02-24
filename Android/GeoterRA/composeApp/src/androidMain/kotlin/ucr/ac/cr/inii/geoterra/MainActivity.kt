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

class MainActivity : ComponentActivity() {
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