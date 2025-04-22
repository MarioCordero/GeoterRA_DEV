package com.inii.geoterra.development.ui.map

import android.content.Context
import android.location.Location
import android.os.Bundle
import android.util.Log
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.Toast
import androidx.lifecycle.lifecycleScope
import com.inii.geoterra.development.R
import com.inii.geoterra.development.interfaces.FragmentListener
import com.inii.geoterra.development.interfaces.MessageListener
import com.inii.geoterra.development.api.APIService
import com.inii.geoterra.development.api.RetrofitClient
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

/**
 * A simple [Fragment] subclass.
 * Use the [MapFragment.newInstance] factory method to
 * create an instance of this fragment.
 */
class MapFragment : PageFragment(), MessageListener {
  private var API_INSTANCE : APIService = RetrofitClient.getAPIService()
  private var listener : FragmentListener? = null
  private val MIN_DISTANCE_CHANGE : Float = 10f

  private lateinit var mapView : MapView
  private var currentOpenMarker: Marker? = null
  private var mapMarkers : MutableMap<String, Marker> = mutableMapOf()
  private var thermalPoints : MutableMap<String, ThermalPoint> = mutableMapOf()
  private lateinit var binding : View

  override fun onCreateView(
    inflater: LayoutInflater, container: ViewGroup?,
    savedInstanceState: Bundle?
  ): View {
    // Inflate the layout for this fragment
    this.binding = inflater.inflate(
      R.layout.fragment_map, container, false
    )

    // Initialize the map view
    this.mapView = this.binding.findViewById(R.id.MapView)

    val layersMenuButton = this.binding.findViewById<Button>(R.id.layersButton)
    layersMenuButton.setOnClickListener{
      val layersMenuFragment = MapLayersMenuFragment()
      layersMenuFragment.show(parentFragmentManager, "layersMenuFragment")
    }

    val centerMapOnUserButton
    = this.binding.findViewById<Button>(R.id.centerUserButton)
    centerMapOnUserButton.setOnClickListener{
      // Try to get the user marker.
      val userMarker = mapMarkers["USER"]
      if (userMarker != null) {
        // Centers the map on the user's location
        this.mapView.controller.setCenter(userMarker.position)
      } else {
        Log.e(
          "MapFragment",
          "El marcador del usuario no está disponible."
        )
      }
    }

    this.setupMapSettings()
    this.setupUserMarker()

    GPSManager.setLocationCallbackListener(object : GPSManager
      .LocationCallbackListener {
        override fun onLocationReady(location: Location) {
          if (::mapView.isInitialized) {
            refreshUserMarker(location.latitude, location.longitude)
          }
          Log.i("GPSManager", "Location ready:" +
            " ${location.latitude}, ${location.longitude}")
        }
      }
    )

    this.requestPoints()

    return this.binding
  }

  override fun onMessageReceived(pointID: String) {
    // Aquí manejas el mensaje recibido
    println("Mensaje recibido: $pointID")
    prepareFragment(pointID)
  }

  override fun onAttach(context: Context) {
    super.onAttach(context)
    if (context is FragmentListener) {
      listener = context
    }
  }

  override fun onDetach() {
    super.onDetach()
    listener = null
  }

  private fun prepareFragment(thermalPointID: String) {
    // Create the thermal point info fragment.
    val infoFragment = ThermalPointInfoFragment.newInstance(
      this.thermalPoints[thermalPointID]!!
    )

    //Begin the transaction.
    this.requireActivity().supportFragmentManager.beginTransaction()
      .replace(R.id.fragment_map, infoFragment)
      .addToBackStack(null)
      .commit()
  }

  /**
   * Establish user marker
   *
   */
  private fun setupUserMarker() {
    // Get the latest user location.
    val coordinates = GPSManager.getLastKnownLocation()
    Log.e(
      "User Coordinates: ",
      "x: ${coordinates?.latitude}, y: ${coordinates?.longitude}"
    )
    // Check if the coordinates are not null
    if (coordinates != null) {
      // Set the user's location on the map
      val userPosition = GeoPoint(coordinates.latitude, coordinates.longitude)
      this.mapView.controller.setCenter(userPosition)

      // Add a marker for the user's location
      val marker = Marker(mapView)
      // Set the marker properties
      marker.position = userPosition
      marker.setAnchor(Marker.ANCHOR_CENTER, Marker.ANCHOR_BOTTOM)
      this.mapView.overlays.add(marker)

      // Set the info window for the marker
      val infoWindow = CustomInfoOnMarker(R.layout.custom_info_on_marker_user
        , mapView
      )

      // Set the message listener for the info window
      marker.infoWindow = infoWindow

      // Handle the marker click event
      marker.setOnMarkerClickListener { clickedMarker, mapView ->
        if (!clickedMarker.isInfoWindowShown) {
          // Close the info window of all other markers.
          mapMarkers.values.forEach { mapMarker ->
            // Close all info windows except the clicked marker.
            if (mapMarker != clickedMarker) {
              mapMarker.closeInfoWindow()
            }
          }

          // Show the info window for the clicked marker.
          clickedMarker.showInfoWindow()
          mapView.controller.setCenter(clickedMarker.position)

          // Set the current open marker to the clicked marker.
          currentOpenMarker = clickedMarker
        } else {
          // Close the info window of the clicked marker.
          clickedMarker.closeInfoWindow()
          currentOpenMarker = null
        }
        // Indicates that the click has been handled.
        true
      }
      // Add the marker to the active markers map
      this.mapMarkers["USER"] = marker
    } else {
      Log.e(
        "User Coordinates Error: ",
        "No se han obtenido las coordenadas del usuario."
      )
    }
  }

  private fun refreshUserMarker(latitude : Double, longitude : Double) {
    // Try to get the user marker.
    val marker = mapMarkers["USER"]
    // If the marker exists, update its position.
    if (marker != null) {
      Log.i("User Coordinates: ", "x: $latitude, y: $longitude")

      // Create a location object with the latest coordinates.
      val lastLocation = Location("").apply {
        this.latitude = marker.position.latitude
        this.longitude = marker.position.longitude
      }

      // Create a location object with the new coordinates.
      val currentLocation = Location("").apply {
        this.latitude = latitude
        this.longitude = longitude
      }

      // Check if the user has moved more than MIN_DISTANCE_CHANGE meters.
      if (lastLocation.distanceTo(currentLocation) > MIN_DISTANCE_CHANGE) {
        Log.i("User Coordinates", "Actualizando posición del usuario")
        // Update the marker position.
        this.mapMarkers["USER"]?.position = GeoPoint(latitude, longitude)
        // Refresh the map.
        this.mapView.invalidate()
      } else {
        Log.i(
          "User Coordinates",
          "Cambio de ubicación menor a $MIN_DISTANCE_CHANGE m, ignorado."
        )
      }
    } else {
      // Set the user's location on the map.
      this.setupUserMarker()
    }
  }

  /**
   * Map manager
   *
   */
  private fun setupMapSettings() {
    // Try to get the map preferences.
    val sharedPreferences = requireContext().getSharedPreferences(
      "map_preferences",
      Context.MODE_PRIVATE
    )
    // Try to load the map preferences.
    Configuration.getInstance().load(requireContext(), sharedPreferences)

    // Set the map tile to default.
    this.mapView.setTileSource(
      org.osmdroid.tileprovider.tilesource
        .TileSourceFactory.DEFAULT_TILE_SOURCE
    )
    // Set the map zoom level.
    this.mapView.controller?.setZoom(18.0)
    // Set the zoom controller visibility.
    this.mapView.zoomController.setVisibility(
      org.osmdroid.views.CustomZoomButtonsController.Visibility.NEVER
    )
    // Disable the multi touch controls.
    this.mapView.setMultiTouchControls(true)

    // Define the map listeners.
    this.mapView.addMapListener(object : MapListener {
      // Sets the on scroll listener to default.
      override fun onScroll(event : ScrollEvent?) : Boolean {
        return true
      }
      // Sets the on zoom listener to default.
      override fun onZoom(event : ZoomEvent?) : Boolean {
        return true
      }

    })
  }

  /**
   * Request points
   *
   */
  private fun requestPoints() {
    val call = this@MapFragment.API_INSTANCE.getMapPoints("Guanacaste")
    call.enqueue(object : Callback<List<ThermalPoint>> {
      override fun onResponse(call : Call<List<ThermalPoint>>,
        response : Response<List<ThermalPoint>>
      ) {
        if (response.isSuccessful) {
          // Obtain the list of thermal points from the response
          val mapPoints = response.body()
          if (mapPoints != null) {
            // Create thermal markers from the thermal points and add
            // them to the map
            setupMapMarkers(mapPoints)
          }
        }
      }
      override fun onFailure(call : Call<List<ThermalPoint>>, t : Throwable) {
        // Show an error message to the user
        Toast.makeText(
          requireContext(),
          "Ha ocurrido un error en la consulta de puntos al servidor.",
          Toast.LENGTH_SHORT
        ).show()
        Log.e("API Error: ", "Error en la consulta de puntos: $t")
      }
    })
  }

  /**
   * Create thermal markers
   *
   * @param points
   */
  private fun setupMapMarkers(points: List<ThermalPoint>) {
    lifecycleScope.launch(Dispatchers.IO) {
      try {
        for (thermalPoint in points) {
          // Convert the point CRT05 coordinates to WGS84.
          val geoPoint = convertCRT05toWGS84(thermalPoint.latitude
                                             , thermalPoint.longitude)
          this@MapFragment.thermalPoints[thermalPoint.pointID] = thermalPoint
          val temperature = thermalPoint.temperature

          // Create a marker and set its properties
          val marker = Marker(mapView)
          marker.position = geoPoint
          marker.title = thermalPoint.pointID
          marker.setAnchor(Marker.ANCHOR_CENTER, Marker.ANCHOR_BOTTOM)

          // Creates a custom info window for the marker.
          val infoWindow = CustomInfoOnMarker(
            R.layout.custom_info_on_marker,
            mapView,
            requireContext(),
            temperature
          )

          // Sets the message listener for the info window.
          infoWindow.setMessageListener(object : MessageListener {
            override fun onMessageReceived(message: String) {
              prepareFragment(message)
            }
          })

          // Set the info window for the marker.
          marker.infoWindow = infoWindow

          // Adds a listener to the marker that will be called when the marker
          // is clicked.
          marker.setOnMarkerClickListener { clickedMarker, _ ->
            if (!clickedMarker.isInfoWindowShown) {
              // Close the info window of all other markers.
              mapMarkers.values.forEach { mapMarker ->
                // Close all info windows except the clicked marker.
                if (mapMarker != clickedMarker) {
                  mapMarker.closeInfoWindow()
                }
              }
              // Show the info window for the clicked marker.
              clickedMarker.showInfoWindow()
              mapView.controller.setCenter(clickedMarker.position)

              // Set the current open marker to the clicked marker.
              currentOpenMarker = clickedMarker
            } else {
              // Close the info window of the clicked marker.
              clickedMarker.closeInfoWindow()
              currentOpenMarker = null
            }
            // Indicates that the click has ben handled.
            true
          }

          // Establish the marker's icon
          marker.setAnchor(Marker.ANCHOR_CENTER, Marker.ANCHOR_BOTTOM)
          mapMarkers["${marker.title}"] = marker
          // Add the marker to the map
          mapView.overlays.add(marker)
        }

        // Refresh the map
        mapView.invalidate()
      } catch (e : Exception) {
        withContext(Dispatchers.Main) {
          Log.e(
            "Thread Error: ",
            "No se pudo iniciar el lifecycle de createThermalMarkers"
          )
        }
      }
    }

  }

  /**
   * Convert c r t05to w g s84
   *
   * @param x
   * @param y
   * @return
   */
  private fun convertCRT05toWGS84(x: Double, y: Double): GeoPoint {
    val crsFactory = CRSFactory()
    val transformFactory = CoordinateTransformFactory()

    // Define the coordinate systems
    val sourceCRS = crsFactory.createFromName("EPSG:5367")
    val targetCRS = crsFactory.createFromName("EPSG:4326")

    // Creates the transform
    val transform = transformFactory.createTransform(sourceCRS, targetCRS)

    // Defines the source and destination coordinates
    val srcCoord = ProjCoordinate(x, y)
    val dstCoord = ProjCoordinate()

    // Does the transformation
    transform.transform(srcCoord, dstCoord)
    val normalizedCoor = GeoPoint(dstCoord.y, dstCoord.x)

    return normalizedCoor
  }

  /**
   * On request permissions result
   *
   * @param requestCode
   * @param permissions
   * @param grantResults
   */
  override fun onRequestPermissionsResult(requestCode : Int,
    permissions : Array<out String>,
    grantResults : IntArray) {
    super.onRequestPermissionsResult(requestCode, permissions, grantResults)
    GPSManager.handlePermissionResult(
      requestCode, grantResults, requireContext()
    )
  }
}