package com.inii.geoterra.development
import androidx.lifecycle.DefaultLifecycleObserver
import androidx.lifecycle.LifecycleOwner
import com.inii.geoterra.development.device.GPSManager
import timber.log.Timber

/**
 * Observes lifecycle events of the application process.
 * Useful for starting/stopping services like GPS when app goes to background/foreground.
 */
class AppLifecycleObserver : DefaultLifecycleObserver {

  override fun onStart(owner: LifecycleOwner) {
    Timber.i("App entered foreground")
    // Aquí podrías reiniciar servicios si es necesario
  }

  override fun onStop(owner: LifecycleOwner) {
    Timber.i("App entered background — stopping GPS updates")
  }
}