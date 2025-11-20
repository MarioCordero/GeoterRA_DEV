package com.inii.geoterra.development.interfaces

import android.location.Location

/**
 * Listener interface for receiving location-related callbacks.
 */
interface LocationCallbackListener {

  /**
   * Called when the last known location is available.
   *
   * @param location The last known location.
   */
  fun onLocationReady(location: Location) {}


  /**
   * Called when a new location is received.
   *
   * @param location The updated location.
   */
  fun onLocationUpdated(location: Location) {}

  /**
   * Called when the location provider (GPS/Network) becomes available.
   *
   * @param provider The name of the provider (e.g., LocationManager.GPS_PROVIDER).
   */
  fun onProviderEnabled(provider: String) {}

  /**
   * Called when the location provider (GPS/Network) is disabled.
   *
   * @param provider The name of the provider (e.g., LocationManager.GPS_PROVIDER).
   */
  fun onProviderDisabled(provider: String) {}

  /**
   * Called when location services are not available due to missing permissions or settings.
   */
  fun onLocationUnavailable() {}

  /**
   * Called when an error occurs during location acquisition.
   *
   * @param message Human-readable description of the error.
   */
  fun onLocationError(message: String) {}
}
