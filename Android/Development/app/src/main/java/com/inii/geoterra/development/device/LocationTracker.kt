package com.inii.geoterra.development.device

import android.Manifest
import android.annotation.SuppressLint
import android.content.Context
import android.content.pm.PackageManager
import android.location.Location
import android.location.LocationListener
import android.location.LocationManager
import android.os.Looper
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.core.content.ContextCompat
import com.inii.geoterra.development.interfaces.LocationCallbackListener
import com.inii.geoterra.development.interfaces.PermissionRequester
import timber.log.Timber
import javax.inject.Inject
import javax.inject.Singleton


/**
 * Manages GPS location updates and permissions.
 *
 * This class handles requesting location permissions, starting and stopping location updates,
 * and notifying registered listeners about location changes, provider status, and errors.
 *
 * It utilizes both GPS and Network providers for location data and allows customization
 * of update frequency and distance.
 *
 */
@Singleton
class LocationTracker @Inject constructor(): LocationListener {

  /** @brief Request code for location permissions */
  private val locationPermissionRequestCode = 1000

  /** @brief Required permission for location access */
  private val requiredPermission = Manifest.permission.ACCESS_FINE_LOCATION

  /** @brief LocationManager instance for managing location services */
  private lateinit var locationManager: LocationManager

  /** @brief Current location of the device */
  private var currentLocation: Location? = null

  /** @brief Flag indicating if the LocationTracker is initialized */
  private var isInitialized = false

  /** @brief Flag indicating if location updates have been started */
  private var started = false

  /** @brief Minimum time interval between location updates in milliseconds */
  private val minTimeMs: Long = 2000

  /** @brief Minimum distance between location updates in meters */
  private val minDistanceM: Float = 1.5f

  /** @brief List of registered locationCallbackListeners */
  private val listeners = mutableListOf<LocationCallbackListener>()

  /**
   * Adds a new locationCallbackListener to receive location updates.
   *
   * @param locationCallbackListener The locationCallbackListener to register.
   */
  fun addLocationCallbackListener(locationCallbackListener: LocationCallbackListener) {
    if (!listeners.contains(locationCallbackListener)) {
      listeners.add(locationCallbackListener)
    }
  }

  /**
   * Removes a previously registered locationCallbackListener.
   *
   * @param locationCallbackListener The locationCallbackListener to unregister.
   */
  fun removeLocationCallbackListener(locationCallbackListener: LocationCallbackListener) {
    listeners.remove(locationCallbackListener)
  }

  /**
   * Clears all registered location listeners.
   */
  fun clearAllLocationListeners() {
    listeners.clear()
  }

  /**
   * Notifies all listeners with the updated location.
   *
   * @param location The new location.
   */
  private fun notifyLocationUpdated(location: Location) {
    listeners.forEach { it.onLocationUpdated(location) }
  }

  /**
   * Notifies all listeners that a provider has been enabled.
   *
   * @param provider The provider name.
   */
  private fun notifyProviderEnabled(provider: String) {
    listeners.forEach { it.onProviderEnabled(provider) }
  }

  /**
   * Notifies all listeners that a provider has been disabled.
   *
   * @param provider The provider name.
   */
  private fun notifyProviderDisabled(provider: String) {
    listeners.forEach { it.onProviderDisabled(provider) }
  }

  /**
   * Notifies listeners that the location service is unavailable.
   */
  private fun notifyLocationUnavailable() {
    listeners.forEach { it.onLocationUnavailable() }
  }

  /**
   * Notifies listeners of a location-related error.
   *
   * @param message Description of the error.
   */
  private fun notifyLocationError(message: String) {
    listeners.forEach { it.onLocationError(message) }
  }

  /**
   * Initializes the location manager.
   *
   * @param permissionRequester The permission requester to use for requesting the location
   *     permission.
   */
  fun initialize(permissionRequester: PermissionRequester) {
    val context = permissionRequester.getContext()
    if (hasLocationPermission(context)) {

      locationManager = context.getSystemService(Context.LOCATION_SERVICE)
        as LocationManager
      isInitialized = true
      startLocationUpdates()

      return
    }

    // Checks if the user has already denied the permission
    val showRationale = permissionRequester.shouldShowRationale(
      requiredPermission
    )

    if (showRationale) {
      // Show the rationale dialog if the user has already denied the permission
      showRationaleDialog(context)
    }

    // Request the permission.
    permissionRequester.requestPermission(
      arrayOf(requiredPermission),
      locationPermissionRequestCode
    )
  }

  /**
   * Shows a rationale dialog to the user explaining why the location permission is needed.
   *
   * @param context The context in which to display the dialog.
   */
  private fun showRationaleDialog(context : Context) {
    AlertDialog.Builder(context)
      .setTitle("Location Permission Required")
      .setMessage("This app needs access to your location. Please grant the permission.")
      .setNegativeButton("Cancel", null)
      .show()
  }

  /**
   * Checks if the `isInitialized` property is true.
   *
   * @return `true` if `isInitialized` is true, `false` otherwise.
   */
  fun isInitialized(): Boolean {
    return this.isInitialized
  }

  /**
   * Starts receiving location updates from both GPS and network providers.
   *
   * This function checks if the LocationTracker has been initialized and if updates have already started.
   * If not initialized, it logs an error and returns.
   * If already started, it logs a warning and returns.
   *
   * It then attempts to request location updates from both `LocationManager.GPS_PROVIDER`
   * and `LocationManager.NETWORK_PROVIDER`.
   * The updates are requested with the configured `minTimeMs` (minimum time interval between updates)
   * and `minDistanceM` (minimum distance change between updates).
   *
   * If the requests are successful, it sets the `started` flag to true and logs an informational message.
   * If any exception occurs during the process, it logs an error message with the exception details.
   *
   * Note: This function is annotated with `@SuppressLint("MissingPermission")` because
   * the permission check is assumed to be handled before calling this method.
   * It's crucial to ensure that `ACCESS_FINE_LOCATION` and `ACCESS_COARSE_LOCATION`
   * permissions are granted before invoking this function.
   */
  @SuppressLint("MissingPermission")
  fun startLocationUpdates() {
    if (!this.isInitialized) {
      Timber.e("The gps was not initialized correctly")
      return
    }

    if (this.started) {
      Timber.w("The gps was already started")
      return
    }

    try {
      // Solicita ubicación desde GPS
      locationManager.requestLocationUpdates(
        LocationManager.GPS_PROVIDER,
        minTimeMs,
        minDistanceM,
        this,
        Looper.getMainLooper()
      )

      // Solicita ubicación desde NETWORK
      locationManager.requestLocationUpdates(
        LocationManager.NETWORK_PROVIDER,
        minTimeMs,
        minDistanceM,
        this,
        Looper.getMainLooper()
      )

      this.started = true
      Timber.i("Actualizaciones de ubicación iniciadas")
    } catch (e: Exception) {
      Timber.e("Error al iniciar actualizaciones: ${e.message}")
    }
  }

  /**
   * Stops receiving location updates.
   *
   * This function checks if the `locationManager` has been initialized and if
   * location updates have been started. If both conditions are true, it
   * removes the location listeners and sets the `started` flag to false.
   */
  fun stopLocationUpdates() {
    if (!::locationManager.isInitialized || !this.started) return

    locationManager.removeUpdates(this)
    this.started = false
    Timber.i("Actualizaciones de ubicación detenidas")
  }

  /**
   * Called when the location has changed.
   *
   * Updates the `currentLocation` property with the new location,
   * logs the new coordinates, and then notifies all registered listeners about
   * both the availability of a new location (onLocationReady) and the specific
   * location update (onLocationUpdated).
   *
   * @param location The new an up-to-date location.
   */
  override fun onLocationChanged(location: Location) {
    // Updates the current location.
    this.currentLocation = location
    Timber.i(
      "Nueva ubicación: ${location.latitude}, ${location.longitude}"
    )

    // Notifies all listeners
    listeners.forEach {
      it.onLocationReady(location)
      it.onLocationUpdated(location)
    }
  }


  /**
   * Retrieves the last known location.
   *
   * This function attempts to get the last known location from both GPS and network providers.
   * It then returns the most recent location of the two.
   *
   * @return The last known [Location] object, or `null` if:
   *         - The `locationManager` has not been initialized.
   *         - Neither GPS nor network providers have a last known location.
   *         - A [SecurityException] occurs while trying to access location services (e.g., missing permissions).
   */
  fun getLastKnownLocation(): Location? {
    if (!::locationManager.isInitialized) return null

    val gpsLocation = try {
      locationManager.getLastKnownLocation(LocationManager.GPS_PROVIDER)
    } catch (e: SecurityException) {
      null
    }

    val netLocation = try {
      locationManager.getLastKnownLocation(LocationManager.NETWORK_PROVIDER)
    } catch (e: SecurityException) {
      null
    }

    // Selects the most recent location from both providers.
    return listOfNotNull(gpsLocation, netLocation).maxByOrNull { it.time }
  }

  /**
   * Checks if the app has the required location permission.
   *
   * @param context The application context.
   * @return True if the permission is granted, false otherwise.
   */
  private fun hasLocationPermission(context: Context): Boolean {
    return ContextCompat.checkSelfPermission(
      context, requiredPermission
    ) == PackageManager.PERMISSION_GRANTED
  }

  fun handlePermissionResult(
    requestCode: Int,
    grantResults: IntArray,
    permissionRequester: PermissionRequester
  ) {
    if (requestCode == locationPermissionRequestCode) {
      if (grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
        Toast.makeText(permissionRequester.getContext(), "Permiso de ubicación concedido", Toast.LENGTH_SHORT).show()
        initialize(permissionRequester)
      } else {
        Toast.makeText(permissionRequester.getContext(), "Permiso de ubicación denegado", Toast.LENGTH_SHORT).show()
      }
    }
  }
}
