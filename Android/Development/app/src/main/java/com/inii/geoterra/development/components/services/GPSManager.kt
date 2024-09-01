package com.inii.geoterra.development.components.services

import android.annotation.SuppressLint
import android.content.Context
import android.content.pm.PackageManager
import android.location.Location
import android.os.Looper
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
 * Object that manages GPS location updates and permissions using FusedLocationProviderClient.
 */
object GPSManager : LocationCallback() {
  // FusedLocationProviderClient for location services
  private lateinit var fusedLocationClient : FusedLocationProviderClient
  // LocationRequest to define the parameters for location updates
  private lateinit var locationRequest : LocationRequest
  private var currentLocation : Location? = null
  private var isInitialized = false
  private const val LOCATION_PERMISSION_REQUEST_CODE = 1000

  /**
   * Initializes the GPSManager.
   */
  fun initialize(context: Context) {
    // Check if location permission is granted
    if (ContextCompat.checkSelfPermission(context, android.Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
      // Request location permission if not granted
      ActivityCompat.requestPermissions(context as AppCompatActivity, arrayOf(android.Manifest.permission.ACCESS_FINE_LOCATION), LOCATION_PERMISSION_REQUEST_CODE)
      return
    }

    // Get FusedLocationProviderClient instance
    fusedLocationClient = LocationServices.getFusedLocationProviderClient(context)
    // Build LocationRequest with high accuracy and defined intervals
    locationRequest = LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, 5000L)
      .setMinUpdateIntervalMillis(2000L)
      .build()

    startLocationUpdates()
    isInitialized = true
  }

  /**
   * Starts location updates.
   */
  @SuppressLint("MissingPermission")
  private fun startLocationUpdates() {
    fusedLocationClient.requestLocationUpdates(locationRequest, this, Looper.getMainLooper())
  }

  /**
   * Gets the last known location.
   */
  fun getLastKnownLocation(): Location? {
    return currentLocation
  }

  /**
   * Stops location updates.
   */
  fun stopLocationUpdates() {
    fusedLocationClient.removeLocationUpdates(this)
  }

  /**
   * Checks if GPSManager is initialized.
   */
  fun isInitialized(): Boolean {
    return isInitialized
  }

  /**
   * Called when a new location is available.
   */
  override fun onLocationResult(locationResult: LocationResult) {
    super.onLocationResult(locationResult)
    currentLocation = locationResult.lastLocation
  }

  /**
   * Handles the result of the permission request.
   *
   * @param requestCode The request code passed in requestPermissions.
   * @param grantResults The grant results for the corresponding permissions.
   * @param context The context used to show Toast messages.
   */
  fun handlePermissionResult(requestCode: Int, grantResults: IntArray, context: Context) {
    if (requestCode == LOCATION_PERMISSION_REQUEST_CODE) {
      if (grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
        Toast.makeText(context, "Location permission granted", Toast.LENGTH_SHORT).show()
        // Re-initialize GPSManager if permission granted
        initialize(context)
      } else {
        Toast.makeText(context, "Location permission denied", Toast.LENGTH_SHORT).show()
      }
    }
  }
}