package com.inii.geoterra.development

import android.app.Application
import androidx.lifecycle.ProcessLifecycleOwner
import com.inii.geoterra.development.device.LocationTracker
import com.inii.geoterra.development.device.MediaPermissionHelper
import com.inii.geoterra.development.interfaces.LocationCallbackListener
import com.inii.geoterra.development.interfaces.PermissionRequester
import dagger.hilt.android.HiltAndroidApp
import org.osmdroid.library.BuildConfig
import timber.log.Timber
import javax.inject.Inject

/**
 * Application class that initializes global configurations and sets up
 * application-wide services such as dependency injection and logging.
 */
@HiltAndroidApp
class Geoterra : Application() {

  @Inject
  lateinit var gpsmanager: LocationTracker

  @Inject
  lateinit var gallerymanager : MediaPermissionHelper

  override fun onCreate() {
    super.onCreate()

    // Set up Timber logging for debug builds
    if (BuildConfig.DEBUG) {
      Timber.plant(Timber.DebugTree())
      Timber.d("Geoterra application initialized (DEBUG mode)")
    } else {
      // Aquí podrías integrar Crashlytics o una versión de Timber en release
      Timber.i("Geoterra application initialized (RELEASE mode)")
    }

    // Observe app lifecycle for background/foreground transitions
    registerAppLifecycleObserver()
  }

  fun propagatePermissionsResult(requestCode: Int, grantResults: IntArray,
    permissionRequester: PermissionRequester) {
    gpsmanager.handlePermissionResult(
      requestCode, grantResults, permissionRequester
    )
    gallerymanager.handlePermissionResult(
      requestCode, grantResults, permissionRequester
    )
  }

  fun isGPSManagerInitialized() = gpsmanager.isInitialized()

  fun isGalleryManagerInitialized() = gallerymanager.isInitialized()

  fun initLocationService(permissionRequester: PermissionRequester) {
    Timber.d("Initializing location service")
    gpsmanager.initialize(permissionRequester)
  }

  fun initGalleryService(permissionRequester: PermissionRequester) {
    Timber.d("Initializing gallery service")
    gallerymanager.initialize(permissionRequester)
  }

  fun addLocationCallBackListener(listener: LocationCallbackListener) {
    gpsmanager.addLocationCallbackListener(listener)
  }

  fun removeLocationCallBackListener(listener: LocationCallbackListener) {
    gpsmanager.removeLocationCallbackListener(listener)
  }

  fun stopLocationUpdates() {
    Timber.d("Stopping location updates")
    gpsmanager.stopLocationUpdates()
  }

  fun startLocationUpdates() {
    Timber.d("Starting location updates")
    gpsmanager.startLocationUpdates()
  }

  fun getLastKnownLocation() = gpsmanager.getLastKnownLocation()

  /**
   * Registers a lifecycle observer for the whole application, useful
   * to stop GPS updates or analytics tracking when the app is backgrounded.
   */
  private fun registerAppLifecycleObserver() {
    ProcessLifecycleOwner.get().lifecycle.addObserver(AppLifecycleObserver())
  }
}
