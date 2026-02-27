package ucr.ac.cr.inii.geoterra

import android.app.Activity
import android.app.Application
import org.koin.android.ext.koin.androidContext
import org.koin.core.context.startKoin
import org.koin.dsl.module
import ucr.ac.cr.inii.geoterra.core.di.appModule
import ucr.ac.cr.inii.geoterra.core.di.networkModule
import ucr.ac.cr.inii.geoterra.core.di.platformSettingsModule
import ucr.ac.cr.inii.geoterra.domain.location.AndroidLocationProvider
import ucr.ac.cr.inii.geoterra.domain.location.LocationProvider
import ucr.ac.cr.inii.geoterra.domain.permissions.AndroidPermissionManager
import ucr.ac.cr.inii.geoterra.domain.permissions.PermissionManager

/**
 * Android Application entry point.
 * Koin MUST be initialized here.
 */
class MainApplication : Application() {
  override fun onCreate() {
    super.onCreate()
    
    val androidModule = module {
      factory<LocationProvider> {
        AndroidLocationProvider(androidContext())
      }
    }
    
    startKoin {
      androidContext(this@MainApplication)
      modules(
        appModule,
        networkModule,
        platformSettingsModule,
        androidModule
      )
    }
  }
}
