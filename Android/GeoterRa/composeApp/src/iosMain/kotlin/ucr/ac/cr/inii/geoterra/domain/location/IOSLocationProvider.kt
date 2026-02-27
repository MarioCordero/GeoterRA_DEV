package ucr.ac.cr.inii.geoterra.domain.location

import kotlinx.cinterop.ExperimentalForeignApi
import kotlinx.cinterop.useContents
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import platform.CoreLocation.*
import platform.Foundation.NSError
import platform.darwin.NSObject
import ucr.ac.cr.inii.geoterra.data.model.local.UserLocation

class IosLocationProvider : LocationProvider {

  private val locationManager = CLLocationManager()

  @OptIn(ExperimentalForeignApi::class)
  override fun observeLocation(): Flow<UserLocation> = callbackFlow {
    val delegate = object : NSObject(), CLLocationManagerDelegateProtocol {
      override fun locationManager(manager: CLLocationManager, didUpdateLocations: List<*>) {
        val locations = didUpdateLocations as List<CLLocation>
        locations.lastOrNull()?.let { location ->
          trySend(
            UserLocation(
              latitude = location.coordinate.useContents { latitude },
              longitude = location.coordinate.useContents { longitude },
              accuracy = location.horizontalAccuracy.toFloat()
            )
          )
        }
      }

      override fun locationManager(manager: CLLocationManager, didFailWithError: NSError) {
        println("Error de ubicación en iOS: ${didFailWithError.localizedDescription}")
      }
    }

    locationManager.delegate = delegate
    locationManager.desiredAccuracy = kCLLocationAccuracyNearestTenMeters
    locationManager.distanceFilter = 5.0

    locationManager.location?.let { lastLocation ->
      trySend(lastLocation.toUserLocation())
    }

    locationManager.startUpdatingLocation()

    awaitClose {
      locationManager.stopUpdatingLocation()
      locationManager.delegate = null
    }
  }

  override fun stop() {
    locationManager.stopUpdatingLocation()
  }
}

@OptIn(ExperimentalForeignApi::class)
private fun CLLocation.toUserLocation(): UserLocation {
  return UserLocation(
    latitude = coordinate.useContents { latitude },
    longitude = coordinate.useContents { longitude },
    accuracy = horizontalAccuracy.toFloat()
  )
}