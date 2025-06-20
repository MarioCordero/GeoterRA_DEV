package com.inii.geoterra.development.ui.map

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.drawable.BitmapDrawable
import android.graphics.drawable.Drawable
import android.location.Location
import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.Toast
import androidx.annotation.DrawableRes
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import com.inii.geoterra.development.R
import com.inii.geoterra.development.interfaces.MessageListener
import com.inii.geoterra.development.api.ThermalPoint
import com.inii.geoterra.development.device.GPSManager
import com.inii.geoterra.development.interfaces.PageFragment
import com.inii.geoterra.development.ui.elements.CustomInfoOnMarker
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.locationtech.proj4j.CRSFactory
import org.locationtech.proj4j.CoordinateTransformFactory
import org.locationtech.proj4j.ProjCoordinate
import org.osmdroid.config.Configuration
import org.osmdroid.events.MapListener
import org.osmdroid.events.ScrollEvent
import org.osmdroid.events.ZoomEvent
import org.osmdroid.util.GeoPoint
import org.osmdroid.views.MapView
import org.osmdroid.views.overlay.Marker
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import androidx.core.graphics.drawable.toDrawable

/**
 * Fragment for displaying an interactive map with thermal points and user location.
 *
 * Handles map rendering, user location tracking, thermal point visualization,
 * and user interactions with map markers. Provides controls for map navigation
 * and layer management.
 *
 * @property MIN_DISTANCE_CHANGE Minimum distance (in meters) required to update user position
 * @property mapView Primary map display component
 * @property currentOpenMarker Currently active marker with visible info window
 * @property mapMarkers Collection of all markers on the map keyed by ID
 * @property thermalPoints Cache of thermal point data associated with markers
 */
class MapFragment : PageFragment(), MessageListener {
  /** Minimum distance threshold for user location updates (meters) */
  private val MIN_DISTANCE_CHANGE: Float = 10f

  /** Reference to the map view component */
  private lateinit var mapView: MapView
  /** Currently active marker with open info window */
  private var currentOpenMarker: Marker? = null
  /** Map of marker IDs to Marker instances */
  private var mapMarkers: MutableMap<String, Marker> = mutableMapOf()
  /** Cache of loaded icons for marker icons */
  private val iconCache = mutableMapOf<Int, Bitmap>()
  /** Map of point IDs to ThermalPoint data objects */
  private var thermalPoints: MutableMap<String, ThermalPoint> = mutableMapOf()

  /**
   * Initializes the fragment view and components.
   *
   * @param inflater LayoutInflater to inflate views
   * @param container Parent view group for the fragment
   * @param savedInstanceState Previously saved fragment state
   * @return Inflated view hierarchy for the fragment
   */
  override fun onCreateView(
    inflater: LayoutInflater, container: ViewGroup?,
    savedInstanceState: Bundle?
  ): View {
    // Inflate the layout for this fragment
    this.binding = inflater.inflate(
      R.layout.fragment_map, container, false
    )

    this.initializeMapView()
    this.setupControlButtons()
    this.setupUserLocationTracking()
    this.requestThermalPoints()
    this.setupBackStackListener()

    return this.binding
  }

  /**
   * Initializes the map view component and applies base settings.
   */
  private fun initializeMapView() {
    mapView = this.binding.findViewById(R.id.MapView)
    setupMapSettings()
  }

  /**
   * Configures all UI control buttons and their click listeners.
   */
  private fun setupControlButtons() {
    setupLayersButton()
    setupCenterUserButton()
  }

  /**
   * Sets up the layers menu button click listener.
   */
  private fun setupLayersButton() {
    this.binding.findViewById<Button>(R.id.layersButton).setOnClickListener {
      showLayersMenu()
    }
  }

  /**
   * Displays the map layers selection menu.
   */
  private fun showLayersMenu() {
    MapLayersMenuFragment().show(parentFragmentManager, "layersMenuFragment")
  }

  /**
   * Sets up the center-on-user button click listener.
   */
  private fun setupCenterUserButton() {
    this.binding.findViewById<Button>(R.id.centerUserButton).setOnClickListener {
      centerMapOnUser()
    }
  }

  /**
   * Centers the map on the user's current location if available.
   */
  private fun centerMapOnUser() {
    this.mapMarkers["USER"]?.let { userMarker ->
      mapView.controller.setCenter(userMarker.position)
    } ?: run {
      Log.e("MapFragment", "User marker not available")
    }
  }

  /**
   * Configures user location tracking and initial marker setup.
   */
  private fun setupUserLocationTracking() {
    GPSManager.setLocationCallbackListener(createLocationCallback())
    setupUserMarker()
  }

  /**
   * Creates the location callback listener for GPS updates.
   *
   * @return Configured LocationCallbackListener instance
   */
  private fun createLocationCallback(): GPSManager.LocationCallbackListener {
    return object : GPSManager.LocationCallbackListener {
      override fun onLocationReady(location: Location) {
        handleNewLocation(location)
      }
    }
  }

  /**
   * Handles new location updates from the GPS system.
   *
   * @param location New Location object containing coordinates
   */
  private fun handleNewLocation(location: Location) {
    if (::mapView.isInitialized) {
      refreshUserMarker(location.latitude, location.longitude)
    }
    Log.i("GPSManager", "Location ready: ${location.latitude}, ${location.longitude}")
  }

  /**
   * Sets up the back stack listener to manage UI visibility.
   */
  private fun setupBackStackListener() {
    parentFragmentManager.addOnBackStackChangedListener {
      if (parentFragmentManager.backStackEntryCount == 0) {
        setButtonsVisibility(true)
      }
    }
  }

  /**
   * Handles incoming messages from other components.
   *
   * @param message Message identifier string
   * @param data Optional payload associated with the message
   */
  override fun onMessageReceived(message: String, data: Any?) {
    when (message) {
      "SHOW_POINT" -> prepareFragment(data as ThermalPoint)
    }
    Log.d("MessageListener", "Received message: $message")
  }

  /**
   * Prepares fragment transition for thermal point detail view.
   *
   * @param pointValue Thermal point data to display
   */
  private fun prepareFragment(pointValue: ThermalPoint) {
    setButtonsVisibility(false)
    showThermalPointInfo(pointValue)
  }

  /**
   * Displays the thermal point info fragment.
   *
   * @param point Thermal point data to display
   */
  private fun showThermalPointInfo(point: ThermalPoint) {
    val infoFragment = ThermalPointInfoFragment.newInstance(point)
    requireActivity().supportFragmentManager.beginTransaction()
      .replace(R.id.fragment_map, infoFragment)
      .addToBackStack(null)
      .commit()
  }

  /**
   * Toggles visibility of map control buttons.
   *
   * @param visible True to show buttons, false to hide
   */
  private fun setButtonsVisibility(visible: Boolean) {
    val visibility = if (visible) View.VISIBLE else View.GONE
    this.binding.findViewById<Button>(R.id.layersButton).visibility = visibility
    this.binding.findViewById<Button>(R.id.centerUserButton).visibility =
      visibility
  }

  // ==================== MARKER MANAGEMENT ====================

  /**
   * Initializes and positions the user location marker.
   */
  private fun setupUserMarker() {
    val coordinates = GPSManager.getLastKnownLocation()
    coordinates?.let {
      createUserMarker(it.latitude, it.longitude)
    } ?: Log.e("UserCoordinates", "Could not obtain user coordinates")
  }

  /**
   * Creates a marker for the user's location.
   *
   * @param latitude Latitude coordinate
   * @param longitude Longitude coordinate
   */
  private fun createUserMarker(latitude: Double, longitude: Double) {
    val userPosition = GeoPoint(latitude, longitude)
    this.mapView.controller.setCenter(userPosition)

    val marker = Marker(this.mapView).apply {
      icon = ContextCompat.getDrawable(
        requireContext(),
        R.drawable.user_point_marker
      )
      position = userPosition
      setAnchor(Marker.ANCHOR_CENTER, Marker.ANCHOR_BOTTOM)
      infoWindow = CustomInfoOnMarker(
        R.layout.custom_info_on_marker_user,
                                       mapView
      )
      setOnMarkerClickListener(::handleMarkerClick)
    }

    this.mapView.overlays.add(marker)
    this.mapMarkers["USER"] = marker
  }

  /**
   * Updates user marker position based on new coordinates.
   *
   * @param latitude New latitude value
   * @param longitude New longitude value
   */
  private fun refreshUserMarker(latitude: Double, longitude: Double) {
    this.mapMarkers["USER"]?.let { marker ->
      updateMarkerPosition(marker, latitude, longitude)
    } ?: setupUserMarker()
  }

  /**
   * Updates a marker's position if significant movement occurred.
   *
   * @param marker Marker to update
   * @param latitude New latitude value
   * @param longitude New longitude value
   */
  private fun updateMarkerPosition(marker: Marker,
    latitude: Double, longitude: Double) {
    val lastLocation = createLocation(
      marker.position.latitude,
      marker.position.longitude
    )
    val currentLocation = createLocation(latitude, longitude)

    if (lastLocation.distanceTo(currentLocation) > this.MIN_DISTANCE_CHANGE) {
      Log.i("UserCoordinates", "Updating user position")
      marker.position = GeoPoint(latitude, longitude)

      lifecycleScope.launch(Dispatchers.IO) {
        mapView.invalidate()
      }
    } else {
      Log.i(
        "UserCoordinates",
        "Movement < $MIN_DISTANCE_CHANGE m, ignoring"
      )
    }
  }

  private fun getCachedIcon(@DrawableRes iconRes: Int): Bitmap {
    return iconCache.getOrPut(iconRes) {
      val options = BitmapFactory.Options().apply {
        inSampleSize = 2  // Reduce resolución a la mitad
      }
      BitmapFactory.decodeResource(resources, iconRes, options)
    }
  }

  /** Creates a Location object from coordinates.
  *
  * @param latitude Latitude value
  * @param longitude Longitude value
  * @return Location object with specified coordinates
  */
  private fun createLocation(latitude: Double, longitude: Double): Location {
    return Location("").apply {
      this.latitude = latitude
      this.longitude = longitude
    }
  }

  /**
   * Handles marker click events for both user and thermal markers.
   *
   * @param clickedMarker Marker that was clicked
   * @param mapView Map view containing the marker
   * @return True indicating the event was handled
   */
  private fun handleMarkerClick(clickedMarker: Marker,
    mapView: MapView): Boolean {
    if (!clickedMarker.isInfoWindowShown) {
      closeAllInfoWindowsExcept(clickedMarker)
      clickedMarker.showInfoWindow()
      mapView.controller.setCenter(clickedMarker.position)
      this.currentOpenMarker = clickedMarker
    } else {
      clickedMarker.closeInfoWindow()
      this.currentOpenMarker = null
    }
    return true
  }

  /**
   * Closes all info windows except the specified marker.
   *
   * @param exception Marker whose info window should remain open
   */
  private fun closeAllInfoWindowsExcept(exception: Marker) {
    this.mapMarkers.values.forEach { marker ->
      if (marker != exception && marker.isInfoWindowShown) {
        marker.closeInfoWindow()
      }
    }
  }

  // ==================== MAP CONFIGURATION ====================

  /**
   * Configures base map settings and behavior.
   */
  private fun setupMapSettings() {
    loadMapPreferences()
    applyMapSettings()
    setupMapListeners()
  }

  /**
   * Loads map preferences from shared storage.
   */
  private fun loadMapPreferences() {
    val sharedPreferences = requireContext().getSharedPreferences(
      "map_preferences", Context.MODE_PRIVATE
    )
    Configuration.getInstance().load(requireContext(), sharedPreferences)
  }

  /**
   * Applies map display settings and defaults.
   */
  private fun applyMapSettings() {
    this.mapView.apply {
      setTileSource(
        org.osmdroid.tileprovider.tilesource.TileSourceFactory.DEFAULT_TILE_SOURCE
      )
      controller?.setZoom(18.0)
      zoomController.setVisibility(
        org.osmdroid.views.CustomZoomButtonsController.Visibility.NEVER
      )
      setMultiTouchControls(true)
    }
  }

  /**
   * Sets up map event listeners.
   */
  private fun setupMapListeners() {
    this.mapView.addMapListener(createMapListener())
  }

  /**
   * Creates a basic map listener for scroll and zoom events.
   *
   * @return Configured MapListener instance
   */
  private fun createMapListener(): MapListener {
    return object : MapListener {
      override fun onScroll(event: ScrollEvent?): Boolean = true
      override fun onZoom(event: ZoomEvent?): Boolean = true
    }
  }

  // ==================== DATA MANAGEMENT ====================

  /**
   * Requests thermal point data from the API.
   */
  private fun requestThermalPoints() {
    val call = apiService.getMapPoints("Guanacaste")
    call.enqueue(createPointsCallback())
  }

  /**
   * Creates the callback handler for thermal points API response.
   *
   * @return Configured Callback instance
   */
  private fun createPointsCallback(): Callback<List<ThermalPoint>> {
    return object : Callback<List<ThermalPoint>> {
      override fun onResponse(
        call: Call<List<ThermalPoint>>,
        response: Response<List<ThermalPoint>>
      ) {
        handlePointsResponse(response)
      }

      override fun onFailure(call: Call<List<ThermalPoint>>, t: Throwable) {
        handlePointsFailure(t)
      }
    }
  }

  /**
   * Handles successful API response for thermal points.
   *
   * @param response API response containing thermal points
   */
  private fun handlePointsResponse(response: Response<List<ThermalPoint>>) {
    if (response.isSuccessful) {
      response.body()?.let { points ->
        Log.i("API Response", "Points received: ${points.size}")
        setupThermalMarkers(points)
      }
    } else {
      showError("Server error: ${response.code()}")
    }
  }

  /**
   * Handles API failure for thermal points request.
   *
   * @param throwable Exception that caused the failure
   */
  private fun handlePointsFailure(throwable: Throwable) {
    Toast.makeText(
      requireContext(),
      "Server point query error",
      Toast.LENGTH_SHORT
    ).show()
    Log.e("API Error", "Point query failure: $throwable")
  }

  /**
   * Creates and displays markers for thermal points.
   *
   * @param points List of thermal points to visualize
   */
  private fun setupThermalMarkers(points: List<ThermalPoint>) {
    lifecycleScope.launch(Dispatchers.IO) {
      try {
        val icon = ContextCompat.getDrawable(
          requireContext(),
          R.drawable.point_marker
        )
        points.forEach { point ->
          Log.i("MarkerCreation", "Creating marker for point: ${point.pointID}")
          createThermalMarker(point, icon)
        }

        mapView.invalidate()
      } catch (e: Exception) {
        Log.e("MarkerCreation", "Failed to create thermal markers", e)
      }
    }
  }

  /**
   * Creates a single thermal point marker.
   *
   * @param thermalPoint Thermal point data
   */
  private fun createThermalMarker(thermalPoint: ThermalPoint,
    definedIcon : Drawable? = null) {
    val geoPoint = convertCRT05toWGS84(thermalPoint.latitude, thermalPoint.longitude)
    this.thermalPoints[thermalPoint.pointID] = thermalPoint

    val marker = Marker(this.mapView).apply {
      definedIcon.apply {
        icon = this
      }
      position = geoPoint
      title = thermalPoint.pointID
      setAnchor(Marker.ANCHOR_CENTER, Marker.ANCHOR_BOTTOM)
      infoWindow = CustomInfoOnMarker(
        R.layout.custom_info_on_marker,
        this@MapFragment.mapView,
        requireContext(),
        thermalPoint.temperature,
        this@MapFragment
      )
      setOnMarkerClickListener(::handleMarkerClick)
    }

    this.mapMarkers[thermalPoint.pointID] = marker
    this.mapView.overlays.add(marker)
  }

  /**
   * Converts CRT05 coordinates to WGS84 standard.
   *
   * @param x CRT05 longitude value
   * @param y CRT05 latitude value
   * @return GeoPoint in WGS84 coordinate system
   */
  private fun convertCRT05toWGS84(x: Double, y: Double): GeoPoint {
    val crsFactory = CRSFactory()
    val transformFactory = CoordinateTransformFactory()

    val sourceCRS = crsFactory.createFromName("EPSG:5367")
    val targetCRS = crsFactory.createFromName("EPSG:4326")

    val transform = transformFactory.createTransform(sourceCRS, targetCRS)

    val srcCoord = ProjCoordinate(x, y)
    val dstCoord = ProjCoordinate()

    transform.transform(srcCoord, dstCoord)
    return GeoPoint(dstCoord.y, dstCoord.x)
  }

  /**
   * Handles permission request results for location services.
   */
  @Deprecated("Deprecated in Java")
  override fun onRequestPermissionsResult(
    requestCode: Int,
    permissions: Array<out String>,
    grantResults: IntArray
  ) {
    super.onRequestPermissionsResult(requestCode, permissions, grantResults)
    GPSManager.handlePermissionResult(requestCode, grantResults, requireContext())
  }
}