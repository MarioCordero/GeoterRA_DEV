package ucr.ac.cr.inii.geoterra.domain.location

import android.annotation.SuppressLint;
import android.content.Context;
import android.location.Location
import android.location.LocationListener
import android.location.LocationManager
import android.os.Looper;
import kotlinx.coroutines.Job
import kotlinx.coroutines.channels.awaitClose

import kotlinx.coroutines.flow.Flow;
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.launch
import ucr.ac.cr.inii.geoterra.data.model.local.UserLocation;

class AndroidLocationProvider(
  private val context: Context

) : LocationProvider, LocationListener{
  
  private val locationManager =
    context.getSystemService(Context.LOCATION_SERVICE) as LocationManager
  
  /**
   * SharedFlow used internally to multicast location updates.
   * Replay = 1 ensures latest value is delivered to new collectors.
   */
  private val internalFlow =
    MutableSharedFlow<UserLocation>(replay = 1)
  
  private var started = false
  
  /**
   * Minimum time interval between updates (milliseconds).
   */
  private val minTimeMs = 2000L
  
  /**
   * Minimum distance between updates (meters).
   */
  private val minDistanceM = 1.5f
  
  /**
   * Observes device location as a cold Flow.
   */
  @SuppressLint("MissingPermission")
  override fun observeLocation():Flow<UserLocation> = callbackFlow {
    if (!started) {
      
      // Register GPS provider (high accuracy)
      locationManager.requestLocationUpdates(
        LocationManager.GPS_PROVIDER,
        minTimeMs,
        minDistanceM,
        this@AndroidLocationProvider,
        Looper.getMainLooper()
      )
      
      // Register Network provider (fallback indoors / faster fix)
      locationManager.requestLocationUpdates(
        LocationManager.NETWORK_PROVIDER,
        minTimeMs,
        minDistanceM,
        this@AndroidLocationProvider,
        Looper.getMainLooper()
      )
      
      started = true
    }
    
    // Collect internal shared flow and forward to callbackFlow
    val forwardingJob: Job = launch {
      internalFlow.collect { location ->
        trySend(location)
      }
    }
    
    awaitClose {
      forwardingJob.cancel()
      stop()
    }
  }
  
  /**
   * Called when a new location is received from the system.
   */
  override fun onLocationChanged(location: Location) {
    internalFlow.tryEmit(
      UserLocation(
        latitude = location.latitude,
        longitude = location.longitude,
        accuracy = location.accuracy
      )
    )
    println("Ubicacion encontrada")
  }
  
  /**
   * Stops receiving updates and unregisters listener.
   */
  override fun stop() {
    if (started) {
      locationManager.removeUpdates(this@AndroidLocationProvider)
      started = false
    }
  }
}
