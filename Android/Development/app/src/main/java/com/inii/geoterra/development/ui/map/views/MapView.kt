package com.inii.geoterra.development.ui.map.views

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Point
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.core.content.ContextCompat
import androidx.fragment.app.viewModels
import androidx.lifecycle.lifecycleScope
import com.inii.geoterra.development.R
import com.inii.geoterra.development.interfaces.MessageListener
import com.inii.geoterra.development.api.ThermalPoint
import com.inii.geoterra.development.databinding.FragmentMapBinding
import com.inii.geoterra.development.device.CoordinateConverter.convertCRT05toWGS84
import com.inii.geoterra.development.interfaces.PageView
import com.inii.geoterra.development.ui.elements.CustomInfoOnMarker
import com.inii.geoterra.development.ui.map.MapLayersMenuFragment
import com.inii.geoterra.development.ui.map.MapViewModel
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch
import org.osmdroid.config.Configuration
import org.osmdroid.events.MapListener
import org.osmdroid.events.ScrollEvent
import org.osmdroid.events.ZoomEvent
import org.osmdroid.util.GeoPoint
import org.osmdroid.views.MapView
import org.osmdroid.views.overlay.Marker
import timber.log.Timber
import androidx.core.graphics.createBitmap
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.withContext
import okhttp3.internal.wait
import org.osmdroid.tileprovider.MapTileProviderBasic
import org.osmdroid.views.Projection
import org.osmdroid.views.drawing.MapSnapshot

/**
 * Fragment for displaying an interactive map with thermal points and user location.
 *
 * This class extends [PageView] and implements [MessageListener].
 * It is responsible for:
 * - Rendering the map using osmdroid.
 * - Tracking and displaying the user's current location on the map.
 * - Visualizing thermal points as markers on the map.
 * - Handling user interactions with map markers, such as clicks to display information windows.
 * - Providing UI controls for map navigation (e.g., centering on user location) and layer management.
 * - Managing the lifecycle of map-related resources and location updates.
 * - Communicating with other components via the [MessageListener] and fragment event system.
 */
@AndroidEntryPoint
class MapView : PageView<FragmentMapBinding, MapViewModel>(
  FragmentMapBinding::inflate,
  MapViewModel::class.java
), MessageListener{

  override val viewModel : MapViewModel by viewModels()

  /** Reference to the map view component */
  private lateinit var mapView: MapView

  /**
   * Initializes the fragment view and components.
   *
   * @param inflater LayoutInflater to inflate views
   * @param container Parent view group for the fragment
   * @return Inflated view hierarchy for the fragment
   */
  override fun onCreatePageView(
    inflater: LayoutInflater, container: ViewGroup?)
  : View {

    this.initializeMapView()

    return this.binding.root
  }

  override fun onCreatePage(savedInstanceState : Bundle?) {
  }

  /**
   * Called when the activity is being destroyed.
   *
   * This method is called by the system when the activity is finishing
   * or being destroyed by the system. It's the final call the activity
   * receives.
   *
   */
  override fun onDestroy() {
    super.onDestroy()
    this.viewModel.stopLocationUpdates()
  }

  /**
   * Called when the activity is no longer the current activity for the user.
   * Stops location updates to conserve battery.
   */
  override fun onPause() {
    super.onPause()
    this.viewModel.stopLocationUpdates()
  }

  /**
   * @brief Sets all the listeners related to the View.
   *
   * Subclasses should implement this method to observe set their listeners.
   */
  override fun setUpListeners() {
    this.binding.apply{

      btnFilters.setOnClickListener {
        MapLayersMenuFragment().show(
          parentFragmentManager,
          "layersMenuFragment"
        )
      }

      btnCenterOnUser.setOnClickListener {
        centerMapOnUser()
      }
    }

  }

  /**
   * @brief Observes ViewModel LiveData for user location changes.
   *
   * This method subscribes to the `userLocation` LiveData within the ViewModel.
   * When the user's location changes, the `handleUserLocationChanged` method is invoked
   * with the updated location data.
   *
   * Subclasses can override this method if they need to observe additional
   * LiveData from the ViewModel or modify the observation behavior for user location.
   * If overriding, ensure to call `super.observeViewModel()` if you still want
   * to observe the user location as defined here.
   */
  override fun observeViewModel() {
    viewLifecycleOwner.lifecycleScope.launchWhenStarted {
      viewModel.userLocation.observe(viewLifecycleOwner) {
        if (::mapView.isInitialized) {
          Timber.d("Updating user marker")
          drawUserMarker(it)
        }
      }

      viewModel.thermalPoints.observe(viewLifecycleOwner) {
        Timber.d("Thermal points updated")
        drawThermalsOnMap(it)
      }

      viewModel.openedMarker.observe(viewLifecycleOwner) {
        if (it != null) {
          mapView.controller.setCenter(it.position)
        }
      }
    }

  }

  /**
   * Called when the activity will start interacting with the user.
   * At this point your activity is at the top of the activity stack, with user input going to it.
   *
   * In this implementation, it also starts location updates via the ViewModel.
   */
  override fun onResume() {
    super.onResume()
    this.viewModel.startLocationUpdates()
  }

  /**
   * Initializes the map view component.
   *
   * This function performs the following actions:
   * 1. Retrieves the MapView instance from the view binding.
   * 2. Applies the initial base settings to the MapView.
   *
   * This method should be called during the setup phase of the
   * component that owns the map (e.g., in `onCreateView` or `onViewCreated`
   * for a Fragment, or `onCreate` for an Activity).
   */
  private fun initializeMapView() {
    this.mapView = this.binding.MapView
    this.applyMapSettings()
  }

  /**
   * Centers the map on the user's current location if available.
   *
   * This function attempts to retrieve the user's location from the `viewModel`.
   * If the location is available (i.e., `viewModel.userLocation.value` is not null),
   * it then uses the `mapView` controller to set the center of the map to this location.
   *
   * If the user's location is not available, an error message is logged to the console
   * indicating that the "User marker not available".
   *
   * This function is private and intended for internal use within the class.
   */
  private fun centerMapOnUser() {
    this.viewModel.userLocation.value?.let {
      this.mapView.controller.setCenter(it)
    }?: run {
      Timber.e("User marker not available, creating it")
      this.drawUserMarker(GeoPoint(9.9, -8.4))
    }
  }

  /**
   * Refreshes the user's marker on the map to a new position.
   *
   * If a marker with the key "USER" already exists in the `viewModel.mapMarkers`,
   * its position is updated to the provided `position`, and the `mapView` is invalidated
   * to redraw the map.
   *
   * If no marker with the key "USER" exists, a new user marker is drawn at the
   * specified `position` by calling `this.drawUserMarker(position)`.
   *
   * @param position The new geographical coordinates (GeoPoint) for the user's marker.
   */
  private fun drawUserMarker(position : GeoPoint) {
    Timber.i("Drawing user marker")
    this.viewModel.mapMarkers.value?.let { markers ->
      markers["USER"]?.let {
        Timber.i("Updating user marker position")
        this.viewModel.setMarkerPosition("USER", position)
        this.mapView.invalidate()
      } ?: run {
        Timber.i("Creating user marker")
        val marker = this.createUserMarker(position)
        this.viewModel.addMapMarker("USER", marker)
        this.mapView.overlays.add(marker)
        this.mapView.invalidate()
      }
    }
  }

  // ==================== MESSAGE HANDLING ====================

  /**
   * Handles incoming messages from other components.
   *
   * @param message Message identifier string
   * @param data Optional payload associated with the message
   */
  override fun onMessageReceived(message: String, data: Any?) {
    when (message) {
      "SHOW_POINT" -> {
        val thermal = data as? ThermalPoint
        if (thermal != null) {
          this.displayThermalInfo(thermal)
        } else {
          Timber.e("Invalid data for SHOW_POINT message")
        }
      }
    }
    Timber.d("Received message: $message")
  }

  /**
   * @brief Handles the events triggered by child fragments.
   *
   * @param event Name of the event
   * @param data Optional data associated with the event
   */
  override fun onPageEvent(event: String, data: Any?) {
    Timber.i("Event: $event")
    when (event) {
      "FINISHED" -> {
        // Handle form submission completion
        Timber.i("FINISHED")
        this.childFragmentManager.popBackStack()
        this.binding.fragmentContainer.visibility = View.GONE

        this.viewModel.startLocationUpdates()
      }
    }
  }

  // ==================== THERMAL POINT HANDLING ====================

  /**
   * Displays detailed information about a thermal point.
   *
   * This function prepares and executes a fragment transaction to show
   * the `ThermalView`. It stops location updates, makes the
   * fragment container visible, and then replaces the current content
   * of the container with the new fragment, adding the transaction to
   * the back stack.
   *
   * @param thermal The `ThermalPoint` object containing the data to be displayed.
   */
  private fun displayThermalInfo(thermal: ThermalPoint) {
    this.viewModel.stopLocationUpdates()
    this.binding.fragmentContainer.visibility = View.VISIBLE

    val thermalFragment = ThermalView.newInstance(thermal)
    this.childFragmentManager.beginTransaction()
      .replace(R.id.fragment_container, thermalFragment)
      .addToBackStack(null)
      .commit()
  }

  // ==================== MARKER MANAGEMENT ====================

  /**
   * Creates and configures a marker to represent the user's location on the map.
   *
   * This function centers the map on the provided location and then creates a new Marker.
   * The marker is styled with a custom icon, positioned at the user's location.
   *
   * @param location The GeoPoint representing the user's current geographical location.
   * @return The newly created and configured Marker object.
   */
  private fun createUserMarker(location : GeoPoint) : Marker {
    this.mapView.controller.setCenter(location)

    val marker = Marker(this.mapView).apply {
      icon = ContextCompat.getDrawable(
        requireContext(),
        R.drawable.user_point_marker
      )
      position = location
      setAnchor(Marker.ANCHOR_CENTER, Marker.ANCHOR_BOTTOM)
      infoWindow = CustomInfoOnMarker(
        R.layout.view_user_marker,
        mapView
      )
      setOnMarkerClickListener(::handleClickOnMarker)
    }

    return marker
  }

  /**
   * Asynchronously creates and displays markers for thermal points on the map.
   *
   * This function iterates through a list of `ThermalPoint` objects and
   * creates a visual marker for each one on the `mapView`.
   *
   * After all markers are potentially created (or attempted), `mapView.invalidate()`
   * is called to refresh the map and display the new markers.
   *
   * Error handling is included to log any exceptions that occur during the
   * marker creation process, preventing the app from crashing and providing
   * debugging information.
   *
   * @param thermals A list of `ThermalPoint` objects, each representing a
   *                 thermal location to be marked on the map.
   */
  private fun drawThermalsOnMap(thermals: List<ThermalPoint>) {
    this.viewLifecycleOwner.lifecycleScope.launch {
      try {
        thermals.forEach { thermal ->
          val marker = createThermalMarker(thermal)
          viewModel.addMapMarker(marker.title, marker)
          mapView.overlays.add(marker)

          Timber.d("Creating marker for point: ${thermal.id}")
        }
        mapView.invalidate()

      } catch (e: Exception) {
        Timber.e(e, "Failed to create thermal markers")
      }
    }
  }

  /**
   * Creates a single thermal point marker on the map.
   *
   * This function takes a [ThermalPoint] object for the marker.
   * It converts the thermal point's coordinates from CRT05 to WGS84,
   * creates a [Marker] object with the specified properties, and sets up
   * a custom info window and click listener.
   *
   * @param thermal The [ThermalPoint] data containing information like ID, longitude, latitude, and temperature.
   * @return The created [Marker] object.
   */
  private fun createThermalMarker(thermal: ThermalPoint) : Marker {
    val coordinates = convertCRT05toWGS84(
      thermal.longitude,
      thermal.latitude
    )

    val marker = Marker(this.mapView).apply {
      icon = ContextCompat.getDrawable(
        requireContext(),
        R.drawable.point_marker
      )
      position = GeoPoint(coordinates.x, coordinates.y)
      title = thermal.id
      setAnchor(Marker.ANCHOR_CENTER, Marker.ANCHOR_BOTTOM)
      infoWindow = CustomInfoOnMarker(
        R.layout.view_poi_marker, this@MapView.mapView,
        requireContext(), thermal,
        thermal.temperature, this@MapView
      )
      setOnMarkerClickListener(::handleClickOnMarker)
    }

    return marker
  }

  /**
   * Handles click events on a map marker.
   *
   * @param clickedMarker The {@link Marker} object that was clicked by the user.
   * @param mapView The {@link MapView} instance where the marker click event occurred.
   * @return Always returns `true` to indicate that the click event has been handled
   *         and no further processing is needed.
   */
  private fun handleClickOnMarker(clickedMarker: Marker,
    mapView: MapView
  ): Boolean {
    if (!clickedMarker.isInfoWindowShown) {
      // Try to close the info window of the currently opened marker.
      val previousMarker = viewModel.openedMarker.value
      previousMarker?.closeInfoWindow()
      // Show and set the clicked marker as the opened marker.
      this.viewModel.setOpenedMarker(clickedMarker)
      clickedMarker.showInfoWindow()
    } else {
      // The marker is already open, close the info window.
      clickedMarker.closeInfoWindow()
      this.viewModel.setOpenedMarker(null)
    }
    return true
  }

  // ==================== MAP CONFIGURATION ====================

  /**
   * Applies map display settings and defaults.
   *
   * This function initializes the map view with various settings:
   * - **Loads Configuration:** It loads any previously saved map preferences
   *   using `SharedPreferences`. If no preferences exist, it uses default
   *   osmdroid configurations.
   * - **Sets Tile Source:** It sets the default tile source for the map.
   * - **Sets Initial Zoom:** It sets the initial zoom level of the map to 18.0.
   * - **Hides Zoom Controls:** It hides the default zoom buttons.
   * - **Enables Multi-Touch:** It enables multi-touch gestures (pinch to zoom, etc.)
   *   for map interaction.
   * - **Adds Map Listener:** It adds a basic `MapListener` to handle scroll and zoom events.
   *   Currently, these event handlers simply return `true`, indicating that the event
   *   has been consumed.
   */
  private fun applyMapSettings() {
    // Load map preferences.
    val sharedPreferences = requireContext().getSharedPreferences(
      "map_preferences", Context.MODE_PRIVATE
    )
    Configuration.getInstance().load(requireContext(), sharedPreferences)
    this.mapView.apply {
      // Set the map tile source and initial zoom level.
      setTileSource(
        org.osmdroid.tileprovider.tilesource.TileSourceFactory.DEFAULT_TILE_SOURCE
      )
      controller?.setZoom(18.0)
      zoomController.setVisibility(
        org.osmdroid.views.CustomZoomButtonsController.Visibility.NEVER
      )
      setMultiTouchControls(true)
      addMapListener(
        object : MapListener {
        override fun onScroll(event: ScrollEvent?): Boolean = true
        override fun onZoom(event: ZoomEvent?): Boolean = true
      })
    }
  }

  /**
   * Verifica si los tiles alrededor del punto están cargados
   */
  private fun areTilesLoadedAround(center: GeoPoint, regionSizePx: Int): Boolean {
    val projection = mapView.projection
    val centerPoint = projection.toPixels(center, null)

    // Verificar varios puntos alrededor del área de interés
    val checkPoints = listOf(
      centerPoint,
      Point(centerPoint.x - regionSizePx/2, centerPoint.y - regionSizePx/2),
      Point(centerPoint.x + regionSizePx/2, centerPoint.y + regionSizePx/2)
    )

    return checkPoints.all { point ->
      val geoPoint = projection.fromPixels(point.x, point.y)
      // OSMdroid no tiene API directa para verificar carga de tiles,
      // pero podemos verificar si el mapa parece estar renderizado
      true // Por ahora asumimos que está cargado después del delay
    }
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
    this.viewModel.onPermissionResult(requestCode, grantResults, this)
  }
}