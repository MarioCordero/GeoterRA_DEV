package com.inii.geoterra.development.ui.map

import android.graphics.Bitmap
import android.location.Location
import androidx.lifecycle.*
import com.inii.geoterra.development.Geoterra
import com.inii.geoterra.development.api.geospatial.models.ThermalPoint
import com.inii.geoterra.development.api.geospatial.models.ThermalPointResponse
import com.inii.geoterra.development.device.FragmentPermissionRequester
import com.inii.geoterra.development.interfaces.LocationCallbackListener
import com.inii.geoterra.development.interfaces.PageViewModel
import com.inii.geoterra.development.ui.map.views.MapView
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import org.osmdroid.util.GeoPoint
import org.osmdroid.views.overlay.Marker
import timber.log.Timber
import javax.inject.Inject

/**
 * @class MapViewModel
 * @brief Specialized ViewModel for managing map-related data and user location tracking.
 *
 * Extends PageViewModel to leverage shared lifecycle and UI state management functionality.
 * Handles location updates, thermal points API requests, caching, and exposes LiveData observables
 * for UI consumption, adhering to MVVM best practices.
 *
 * @property MIN_DISTANCE_CHANGE Minimum displacement in meters to trigger location update.
 *
 * @see PageViewModel
 */
@HiltViewModel
class MapViewModel @Inject constructor(
  private val app: Geoterra
) : PageViewModel(app) {

  /**
   * @brief Minimum displacement in meters to trigger location update.
   */
  companion object {
    private const val MIN_DISTANCE_CHANGE : Float = 2f
  }

  /** Live data holding the currently opened marker */
  private val _openedMarker = MutableLiveData<Marker?>()
  val openedMarker : LiveData<Marker?> get() = _openedMarker

  /** LiveData holding the current user location as a GeoPoint */
  private val _userLocation = MutableLiveData<GeoPoint>()
  val userLocation: LiveData<GeoPoint> get() = _userLocation

  /** Map of marker IDs to Marker instances */
  private val _mapMarkers = MutableLiveData<MutableMap<String, Marker>>()
  val mapMarkers : LiveData<MutableMap<String, Marker>> get() = _mapMarkers

  /** Cache of loaded icons for marker icons */
  private val _iconCache = MutableLiveData<MutableMap<Int, Bitmap>>()
  val iconCache : LiveData<MutableMap<Int, Bitmap>> get() = _iconCache

  /** LiveData holding the current list of thermal points retrieved from backend */
  private var _thermalPoints: MutableLiveData<MutableList<ThermalPoint>>
    = MutableLiveData(mutableListOf())
  val thermalPoints: MutableLiveData<MutableList<ThermalPoint>> get()
    = _thermalPoints

  init {
    initializeLocationTracking()
    fetchThermalPoints("Guanacaste")
  }

  /**
   * @brief Initializes the GPS location listener to update user location LiveData.
   *
   * Sets a callback on LocationTracker to receive location updates asynchronously.
   * Filters updates by minimum distance threshold to prevent redundant UI refreshes.
   * Also initializes LiveData with the last known location if available.
   */
  private fun initializeLocationTracking() {
    this.app.addLocationCallBackListener(
      object : LocationCallbackListener {
        override fun onLocationReady(location: Location) {
          val newGeoPoint = GeoPoint(location.latitude, location.longitude)
          _userLocation.value = newGeoPoint
          Timber.d("User location updated: $newGeoPoint")
//          if (shouldUpdateLocation(_userLocation.value, newGeoPoint)) {
//
//          } else {
//            Timber.d("User location not updated: $newGeoPoint")
//          }
        }
      }
    )
    // Preload last known location to LiveData
    this.app.getLastKnownLocation()?.let {
      _userLocation.value = GeoPoint(it.latitude, it.longitude)
    }
  }

  /**
   * @brief Determines if the displacement between old and new location exceeds threshold.
   *
   * Uses Android's Location.distanceBetween method to calculate geodesic distance in meters.
   *
   * @param oldLocation Previous location wrapped as GeoPoint or null if none.
   * @param newLocation Newly received location wrapped as GeoPoint.
   * @return True if distance is greater than MIN_DISTANCE_CHANGE; otherwise false.
   */
  private fun shouldUpdateLocation(oldLocation: GeoPoint?,
    newLocation: GeoPoint): Boolean {
    val results = FloatArray(1)
    this.viewModelScope.launch {
      if (oldLocation != null) {
        Location.distanceBetween(
          oldLocation.latitude, oldLocation.longitude,
          newLocation.latitude, newLocation.longitude,
          results
        )
      }
    }
    return results[0] > MIN_DISTANCE_CHANGE
  }

  /**
   * @brief Initiates asynchronous request to backend API for thermal points.
   *
   * Launches a coroutine on IO dispatcher to perform the network call using Retrofit.
   * Updates thermalPoints LiveData on success or errorMessage LiveData on failure.
   *
   * @param region The geographic region identifier string to filter points.
   */
  private fun fetchThermalPoints(region: String) {
    this.viewModelScope.launch {
      try {
        val call = API.fetchThermalPoints(region)
        call.enqueue(object : Callback<ThermalPointResponse> {
          override fun onResponse(
            call: Call<ThermalPointResponse>,
            response: Response<ThermalPointResponse>
          ) {
            when {
              response.isSuccessful -> response.body()?.let {
                val thermals = mutableListOf<ThermalPoint>()
                thermals.addAll(it.points)
                _thermalPoints.value = thermals
              } else -> {
              _errorMessage.value = "Servidor rechazó la petición: ${response
                .code()}"
              }
            }
          }

          override fun onFailure(call: Call<ThermalPointResponse>, t: Throwable) {
            _errorMessage.value = "Error de conexión: ${t.localizedMessage}"
          }
        })
      } catch (ex: Exception) {
        _errorMessage.value = "Error de conexión desconcido: ${ex
          .localizedMessage}"
      }
    }
  }

  /**
   * Sets the currently opened marker.
   *
   * This function updates the `_openedMarker` LiveData with the provided `marker`.
   * Observers of `_openedMarker` will be notified of this change.
   *
   * @param marker The [Marker] to be set as the opened marker. Can be null if no marker is currently open.
   */
  fun setOpenedMarker(marker : Marker?) {
    this._openedMarker.value = marker
  }

  fun setMapMarkers(markers: List<Marker>) {
    val markersMap = mutableMapOf<String, Marker>()
    markers.forEach {
      markersMap[it.id] = it
    }
    this._mapMarkers.value = markersMap
  }

  /**
   * Sets the position of a marker on the map.
   *
   * @param key The key of the marker to update.
   * @param newPosition The new position of the marker.
   */
  fun setMarkerPosition(key: String, newPosition: GeoPoint) {
    this.viewModelScope.launch {
      val markers = _mapMarkers.value ?: mutableMapOf()
      markers[key]?.position = newPosition
      _mapMarkers.value = markers
    }
  }

  /**
   * Adds a map marker to the internal map of markers.
   *
   * @param key The key to associate with the marker. This can be used to later retrieve or remove the marker.
   * @param marker The Marker object to add.
   */
  fun addMapMarker(key : String, marker: Marker) {
    this.viewModelScope.launch {
      val markers = _mapMarkers.value ?: mutableMapOf()
      markers[key] = marker
      _mapMarkers.value = markers
    }
  }

  fun onPermissionResult(requestCode: Int, grantResults: IntArray,
    view: MapView
  ) {
    this.app.propagatePermissionsResult(
      requestCode, grantResults, FragmentPermissionRequester(view)
    )
  }

//  /**
//   * @brief Retrieves drawable icon from cache or loads it from resources.
//   *
//   * Caches drawable references to optimize repeated resource access and memory usage.
//   *
//   * @param resId Drawable resource identifier.
//   * @return Drawable object corresponding to the resource ID.
//   */
//  private fun getCachedIcon(@DrawableRes iconRes: Int): Bitmap? {
//    return this.iconCache.value?.getOrPut(iconRes) {
//      val options = BitmapFactory.Options().apply {
//        // Reduces the resolution to half, reducing memory usage.
//        inSampleSize = 2
//      }
//      BitmapFactory.decodeResource(resources, iconRes, options)
//    } ?: return null
//  }

  /**
   * @brief Instructs LocationTracker to stop location updates.
   *
   * Should be called on lifecycle events to prevent unnecessary battery drain.
   */
  fun stopLocationUpdates() {
    this.app.stopLocationUpdates()
  }

  /**
   * @brief Instructs LocationTracker to start location updates.
   *
   * Should be called on lifecycle events to resume location tracking.
   */
  fun startLocationUpdates() {
    this.app.startLocationUpdates()
  }

}
