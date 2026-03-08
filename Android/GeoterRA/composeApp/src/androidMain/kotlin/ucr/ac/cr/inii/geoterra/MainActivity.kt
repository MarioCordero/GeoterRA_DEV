package ucr.ac.cr.inii.geoterra

import android.content.Context
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.Composable
import org.koin.core.context.loadKoinModules
import org.koin.dsl.module
import ucr.ac.cr.inii.geoterra.domain.pdf.PDFManager
import ucr.ac.cr.inii.geoterra.domain.permissions.AndroidPermissionManager
import ucr.ac.cr.inii.geoterra.domain.permissions.PermissionManager

@Suppress("DEPRECATION") class MainActivity : ComponentActivity() {
  
  private lateinit var permissionManager: AndroidPermissionManager
  
  override fun onCreate(savedInstanceState: Bundle?) {
    enableEdgeToEdge()
    super.onCreate(savedInstanceState)

    ActivityContext.mContext = this

    permissionManager = AndroidPermissionManager(this)

    loadKoinModules(
      module {
        factory<PermissionManager> { permissionManager }
        single { PDFManager() }
        single<Context> { this@MainActivity }
      }
    )
    
    setContent {
      App()
    }
  }
}

@Composable
fun AppAndroidPreview() {
  App()
}