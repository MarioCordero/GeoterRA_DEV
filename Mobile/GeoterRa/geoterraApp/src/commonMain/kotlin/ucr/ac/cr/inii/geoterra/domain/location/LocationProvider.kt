package ucr.ac.cr.inii.geoterra.domain.location

import kotlinx.coroutines.flow.Flow

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