package ucr.ac.cr.inii.geoterra

import android.app.Application
import org.koin.android.ext.koin.androidContext
import org.koin.core.context.startKoin
import ucr.ac.cr.inii.geoterra.core.di.appModule

/**
 * Android Application entry point.
 * Koin MUST be initialized here.
 */
class MainApplication : Application() {

    override fun onCreate() {
        super.onCreate()

        startKoin {
            androidContext(this@MainApplication)
            modules(appModule)
        }
    }
}
