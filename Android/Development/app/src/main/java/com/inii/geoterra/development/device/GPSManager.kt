package com.inii.geoterra.development.device

import android.annotation.SuppressLint
import android.content.Context
import android.content.pm.PackageManager
import android.location.Location
import android.os.Looper
import android.util.Log
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationCallback
import com.google.android.gms.location.LocationRequest
import com.google.android.gms.location.LocationResult
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority

/**
 * @brief Object managing GPS location updates and permissions using FusedLocationProviderClient.
 *
 * This singleton handles location permission management, initializes location services,
 * and provides continuous location updates through a callback interface.
 */
object GPSManager : LocationCallback() {

  /** @brief Request code for location permission handling */
  private const val LOCATION_PERMISSION_REQUEST_CODE = 1000

  /** @brief FusedLocationProviderClient instance for accessing location services */
  private lateinit var fusedLocationClient: FusedLocationProviderClient

  /** @brief Configuration parameters for location updates */
  private lateinit var locationRequest: LocationRequest

  /** @brief Cache for the most recently received location */
  private var currentLocation: Location? = null

  /** @brief Initialization state flag */
  private var isInitialized = false

  /** @brief Flag indicating if location updates are active */
  private var started = false

  /** @brief Listener for location update events */
  private var locationCallbackListener : LocationCallbackListener? = null

  /**
   * @brief Initializes the GPSManager components
   * @param context Context for permission checks and service initialization
   *
   * Checks location permissions, initializes FusedLocationProviderClient,
   * and configures location request parameters. Starts location updates
   * if permissions are already granted.
   */
  fun initialize(context: Context) {
    // Permission check for fine location access
    if (ContextCompat.checkSelfPermission(
        context,
        android.Manifest.permission.ACCESS_FINE_LOCATION
      ) != PackageManager.PERMISSION_GRANTED) {
      // Request missing permission from host activity
      ActivityCompat.requestPermissions(
        context as AppCompatActivity,
        arrayOf(android.Manifest.permission.ACCESS_FINE_LOCATION),
        LOCATION_PERMISSION_REQUEST_CODE
      )
      Log.i("GPSManager", "Location permission not granted")
    } else {
      Log.i("GPSManager", "Location permission already granted")
      // Initialize location service client
      this.fusedLocationClient = LocationServices
        .getFusedLocationProviderClient(
        context
      )
      // Configure location update parameters
      this.locationRequest = LocationRequest.Builder(
        Priority.PRIORITY_HIGH_ACCURACY, 5000L
      ).setMinUpdateIntervalMillis(2000L).build()
      this.isInitialized = true

      this.startLocationUpdates()
    }
  }

  /**
   * @brief Starts receiving location updates
   *
   * Requires ACCESS_FINE_LOCATION permission to be granted. Uses main looper
   * for callback execution.
   */
  @SuppressLint("MissingPermission")
  fun startLocationUpdates() {
    if (!::fusedLocationClient.isInitialized) {
      Log.e(
        "Location updates",
        " fusedLocationClient is not initialized"
      )
      this.isInitialized = false
      return
    }

    if (this.started) {
      Log.e("Location updates", "Already started")
      return
    }

    this.fusedLocationClient.requestLocationUpdates(
      this.locationRequest,
      this,
      Looper.getMainLooper()
    )
    this.started = true
  }

  /**
   * @brief Stops active location updates
   */
  fun stopLocationUpdates() {
    if (!::fusedLocationClient.isInitialized) {
      Log.e(
        "Location updates",
        " fusedLocationClient is not initialized"
      )
      this.isInitialized = false
      return
    }
    if (!this.started) {
      Log.e("Location updates", "Already stopped")
      return
    }
    this.fusedLocationClient.removeLocationUpdates(this)
    this.started = false
  }

  /**
   * @brief Registers a location update listener
   * @param listener Callback implementation to receive location events
   */
  fun setLocationCallbackListener(listener: LocationCallbackListener) {
    locationCallbackListener = listener
  }

  /**
   * @brief Retrieves the last known valid location
   * @return Most recent Location object or null if unavailable
   */
  fun getLastKnownLocation(): Location? {
    if (currentLocation == null) {
      Log.e("GPSManager", "Location not available")
    }
    return currentLocation
  }

  /**
   * @brief Checks initialization status
   * @return Boolean indicating initialization state
   */
  fun isInitialized(): Boolean {
    return isInitialized
  }

  /**
   * @brief Processes permission request results
   * @param requestCode Request identifier from permission request
   * @param grantResults Array of permission grant results
   */
  fun handlePermissionResult(requestCode: Int, grantResults: IntArray,
    context: Context) {
    if (requestCode == LOCATION_PERMISSION_REQUEST_CODE) {
      if (grantResults.isNotEmpty() && grantResults[0]
        == PackageManager.PERMISSION_GRANTED) {
        Toast.makeText(
          context,
          "Location permission granted",
          Toast.LENGTH_SHORT
        ).show()
        // Restart initialization with granted permission
        initialize(context)
      } else {
        Toast.makeText(
          context,
          "Location permission denied",
          Toast.LENGTH_SHORT
        ).show()
      }
    }
  }

  /**
   * @brief Handles new location updates
   * @param locationResult Container for received location data
   *
   * Called by the location services when new locations are available.
   * Updates current location cache and notifies registered listeners.
   */
  override fun onLocationResult(locationResult: LocationResult) {
    super.onLocationResult(locationResult)
    this.currentLocation = locationResult.lastLocation
    Log.i(
      "GPSManager", "New location: ${this.currentLocation?.latitude}" +
      ", ${this.currentLocation?.longitude}"
    )
    // Notify listener with non-null location (enforced by !! operator)
    this.locationCallbackListener?.onLocationReady(this.currentLocation !!)
  }

  /**
   * @brief Interface for receiving location update notifications
   */
  interface LocationCallbackListener {
    /**
     * @brief Called when a new location is available
     * @param location Received Location object with coordinates
     */
    fun onLocationReady(location: Location)
  }

}
