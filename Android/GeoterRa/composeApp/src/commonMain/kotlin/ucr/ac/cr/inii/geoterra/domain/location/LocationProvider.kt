package ucr.ac.cr.inii.geoterra.domain.location

import kotlinx.coroutines.flow.Flow
import org.maplibre.compose.location.Location
import ucr.ac.cr.inii.geoterra.data.model.local.UserLocation

interface LocationProvider {
  
  /**
   * Starts location updates and emits user position changes.
   */
  fun observeLocation(): Flow<UserLocation>
  
  /**
   * Stops location updates.
   */
  fun stop()
}