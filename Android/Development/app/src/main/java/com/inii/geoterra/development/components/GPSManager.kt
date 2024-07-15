package com.inii.geoterra.development.components
import android.annotation.SuppressLint
import android.content.Context
import android.location.Location
import android.location.LocationListener
import android.location.LocationManager
import android.os.Bundle
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import android.content.pm.PackageManager
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

/**
 * Object that manages GPS location updates and permissions.
 */
object GPSManager : LocationListener {

  private lateinit var locationManager: LocationManager
  private var currentLocation: Location? = null

  /**
   * Request code for location permission.
   */
  private const val LOCATION_REQUEST_CODE = 1000

  private var isInitialized = false

  /**
   * Initializes the GPS service.
   *
   * @param context The context used to access system services.
   */
  fun initialize(context: Context) {
    if (ContextCompat.checkSelfPermission(context, android.Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
      ActivityCompat.requestPermissions(context as AppCompatActivity, arrayOf(android.Manifest.permission.ACCESS_FINE_LOCATION), LOCATION_REQUEST_CODE)
      return
    }
    locationManager = context.getSystemService(Context.LOCATION_SERVICE) as LocationManager
    startLocationUpdates()
    isInitialized = true
  }

  /**
   * Starts requesting location updates from both GPS and Network providers.
   */
  @SuppressLint("MissingPermission")
  private fun startLocationUpdates() {
    locationManager.requestLocationUpdates(LocationManager.GPS_PROVIDER, 5000L, 10f, this)
    locationManager.requestLocationUpdates(LocationManager.NETWORK_PROVIDER, 5000L, 10f, this)
  }

  /**
   * Returns the last known location.
   *
   * @return The last known location, or null if no location is available.
   */
  fun getLastKnownLocation(): Location? {
    return currentLocation
  }

  /**
   * Checks if the com.inii.geoterra.development.Components.GPSManager is initialized.
   *
   * @return True if initialized, false otherwise.
   */
  fun isInitialized(): Boolean {
    return isInitialized
  }

  /**
   * Called when the location has changed.
   *
   * @param location The new location.
   */
  override fun onLocationChanged(location: Location) {
    currentLocation = location
  }

  /**
   * Called when the provider status changes.
   *
   * @param provider The name of the provider.
   * @param status The status of the provider.
   * @param extras Additional status information.
   */
  override fun onStatusChanged(provider: String?, status: Int, extras: Bundle?) {
  }

  /**
   * Called when the provider is enabled by the user.
   *
   * @param provider The name of the provider.
   */
  override fun onProviderEnabled(provider: String) {
  }

  /**
   * Called when the provider is disabled by the user.
   *
   * @param provider The name of the provider.
   */
  override fun onProviderDisabled(provider: String) {
  }

  /**
   * Handles the result of the permission request.
   *
   * @param requestCode The request code passed in requestPermissions.
   * @param grantResults The grant results for the corresponding permissions.
   * @param context The context used to show Toast messages.
   */
  fun handlePermissionResult(requestCode: Int, grantResults: IntArray, context: Context) {
    if (requestCode == LOCATION_REQUEST_CODE) {
      if (grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
        Toast.makeText(context, "Permiso de ubicación concedido", Toast.LENGTH_SHORT).show()
      } else {
        Toast.makeText(context, "Permiso de ubicación denegado", Toast.LENGTH_SHORT).show()
      }
    }
  }
}
