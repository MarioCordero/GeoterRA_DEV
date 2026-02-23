package ucr.ac.cr.inii.geoterra

import android.app.Application
import org.koin.android.ext.koin.androidContext
import org.koin.core.context.startKoin
import ucr.ac.cr.inii.geoterra.core.di.appModule
import ucr.ac.cr.inii.geoterra.core.di.networkModule
import ucr.ac.cr.inii.geoterra.core.di.platformSettingsModule

/**
 * Android Application entry point.
 * Koin MUST be initialized here.
 */
class MainApplication : Application() {
  override fun onCreate() {
    super.onCreate()
    
    // Usamos la función compartida pero pasamos el contexto de Android
    startKoin {
      androidContext(this@MainApplication)
      modules(
        appModule,
        networkModule,
        platformSettingsModule
      )
    }
  }
}
