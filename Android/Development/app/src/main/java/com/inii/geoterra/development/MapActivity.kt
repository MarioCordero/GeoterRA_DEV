package com.inii.geoterra.development

import android.content.Context
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.Button
import android.widget.Toast
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.lifecycle.lifecycleScope
import com.google.android.material.bottomnavigation.BottomNavigationView
import com.inii.geoterra.development.components.ActivityNavigator
import com.inii.geoterra.development.components.api.RetrofitClient
import com.inii.geoterra.development.components.api.ThermalPoint
import com.inii.geoterra.development.components.services.GPSManager
import com.inii.geoterra.development.components.services.SessionManager
import com.inii.geoterra.development.ui.CustomInfoOnMarker
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
import org.osmdroid.tileprovider.tilesource.TileSourceFactory
import org.osmdroid.util.GeoPoint
import org.osmdroid.views.CustomZoomButtonsController
import org.osmdroid.views.MapView
import org.osmdroid.views.overlay.Marker
import org.osmdroid.views.overlay.compass.CompassOverlay
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

/**
 * Map activity
 *
 * @constructor Create empty Map activity
 */
class MapActivity : AppCompatActivity() {
  private lateinit var mapView : MapView
  private lateinit var rootView : View
  private lateinit var bottomNavigationView : BottomNavigationView
  private var activeMarkers : MutableMap<String, Marker> = mutableMapOf()
  private var thermalPoints: MutableMap<String, GeoPoint> = mutableMapOf()
  // Define the BoundingBox for the restricted area (e.g., a country)

  // TODO: reestructuracion de codigo a partes mas dindependientes.
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    enableEdgeToEdge()
    setContentView(R.layout.activity_map)
    ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.mapLayout)) { v, insets ->
      val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
      v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
      insets
    }
    this.rootView = findViewById(R.id.mapLayout)
    // Initialize the map view
    this.mapView = this.rootView.findViewById(R.id.MapView)
    // Initialize the bottom navigation view
    this.bottomNavigationView = this.rootView.findViewById(R.id.bottom_menu)


    setupBottomMenuListener()

    val centerMapOnUserButton = findViewById<Button>(R.id.centerUserButton)
    centerMapOnUserButton.setOnClickListener{
      mapView.controller.setCenter(activeMarkers["User"]!!.position)
    }

    mapManager()
    establishUserMarker()
    requestPoints()
    setupMapListener()
  }

  /**
   * Establish user marker
   *
   */
  private fun establishUserMarker() {
    // Get user coordinates
    val coordinates = GPSManager.getLastKnownLocation()
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
      val infoWindow = CustomInfoOnMarker(R.layout.custom_info_on_marker, mapView, 0.0)
      marker.infoWindow = infoWindow

      // Handle the marker click event
      marker.setOnMarkerClickListener { clickedMarker, mapView ->
        if (!marker.isInfoWindowShown) {
          clickedMarker.showInfoWindow()
          // Center the map on the clicked marker
          mapView.controller.setCenter(marker.position)
        } else {
          clickedMarker.closeInfoWindow()
        }
        // Indicates that the click has ben handled.
        true
      }
      // Add the marker to the active markers map
      activeMarkers["User"] = marker
    } else {
      Log.e(
        "User Coordinates Error: ",
        "No se han obtenido las coordenadas del usuario."
      )
    }
  }

  /**
   * Map manager
   *
   */
  private fun mapManager() {
    // Load map preferences
    val sharedPreferences = this.getSharedPreferences(
      "map_preferences",
      Context.MODE_PRIVATE
    )
    Configuration.getInstance().load(this@MapActivity, sharedPreferences)

    // Set up the map view
    val compassOverlay = CompassOverlay(this, mapView)
    compassOverlay.enableCompass()
    compassOverlay.setCompassCenter(40F, 60F)
    mapView.zoomController.setVisibility(
      CustomZoomButtonsController.Visibility.SHOW_AND_FADEOUT
    )
    mapView.setMultiTouchControls(false)

    // Set up properties of the map
    with(mapView) {
      this.setTileSource(TileSourceFactory.DEFAULT_TILE_SOURCE)
      this.controller?.setZoom(18.0)
      this.zoomController?.setVisibility(CustomZoomButtonsController.Visibility.ALWAYS)
      this.setMultiTouchControls(true)
      this.overlays?.add(compassOverlay)
    }

  }

  /**
   * Request points
   *
   */
  private fun requestPoints() {
    lifecycleScope.launch(Dispatchers.IO) {
      try {
        val apiService = RetrofitClient.getAPIService()
        val call = apiService.getMapPoints("Guanacaste")
        withContext(Dispatchers.Main) {
          call.enqueue(object : Callback<List<ThermalPoint>> {
            override fun onResponse(call : Call<List<ThermalPoint>>,
                                    response : Response<List<ThermalPoint>>) {
              if (response.isSuccessful) {
                // Obtain the list of thermal points from the response
                val mapPoints = response.body()
                if (mapPoints != null) {
                  // Create thermal markers from the thermal points and add
                  // them to the map
                  createThermalMarkers(mapPoints)
                }
              }
            }

            override fun onFailure(call : Call<List<ThermalPoint>>, t : Throwable) {
              // Show an error message to the user
              Toast.makeText(
                this@MapActivity,
                "Ha ocurrido un error en la consulta de puntos al servidor.",
                Toast.LENGTH_SHORT
              ).show()
              Log.e("API Error: ", "Error en la consulta de puntos: $t")
            }
          })
        }
      } catch (e: Exception) {
        withContext(Dispatchers.Main) {
          Log.e(
            "Thread Error: ",
            "No se pudo iniciar el lifecycle de RequestPoints"
          )
        }
      }
    }
  }

  /**
   * Create thermal markers
   *
   * @param points
   */
  private fun createThermalMarkers(points: List<ThermalPoint>) {
    lifecycleScope.launch(Dispatchers.IO) {
      try {
        for (point in points) {
          // Convert the point CRT05 coordinates to WGS84.
          val geoPoint = convertCRT05toWGS84(point.latitude, point.longitude)
          // Store the GeoPoint.
          thermalPoints[point.pointID] = geoPoint
          val temperature = point.temperature

          // Create a marker and set its properties
          val marker = Marker(mapView)
          marker.position = geoPoint
          marker.title = point.pointID
          marker.setAnchor(Marker.ANCHOR_CENTER, Marker.ANCHOR_BOTTOM)
          val infoWindow = CustomInfoOnMarker(R.layout.custom_info_on_marker, mapView,
                                              temperature)
          marker.infoWindow = infoWindow

          // Adds a listener to the marker that will be called when the marker is clicked.
          marker.setOnMarkerClickListener { clickedMarker, _ ->
            if (!marker.isInfoWindowShown) {
              // Show the info window and center the map on the clicked marker
              clickedMarker.showInfoWindow()
              mapView.controller.setCenter(marker.position)
            } else {
              clickedMarker.closeInfoWindow()
            }
            // Indicates that the click has ben handled.
            true
          }

          // Establish the marker's icon
          marker.setAnchor(Marker.ANCHOR_CENTER, Marker.ANCHOR_BOTTOM)
          activeMarkers["${marker.title}"] = marker
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
    val sourceCRS = crsFactory.createFromName("EPSG:5367") // Reemplaza XXXXX con el código EPSG del sistema CRT05
    val targetCRS = crsFactory.createFromName("EPSG:4326") // EPSG:4326 es el código para WGS84

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
   * Setup map listener
   *
   */
  private fun setupMapListener() {
    this.mapView.addMapListener(object : MapListener {
      override fun onScroll(event : ScrollEvent?) : Boolean {
        //restrictMapMovement()
        return true
      }

      override fun onZoom(event : ZoomEvent?) : Boolean {
        return true
      }

    })
  }

  /**
   * Setup bottom menu listener
   *
   */
  private fun setupBottomMenuListener() {
    // Set the selected item in the bottom navigation view
    this.bottomNavigationView.selectedItemId = R.id.mapItem
    // Set up the bottom navigation listener
    bottomNavigationView.setOnItemSelectedListener { item ->
      // Handle item selection and navigate to the corresponding activity
      when (item.itemId) {
        R.id.homeItem -> {
          ActivityNavigator.changeActivity(this, MainActivity::class.java)
          true
        }
        R.id.dashboardItem-> {

          ActivityNavigator.changeActivity(this, RequestActivity::class.java)
          true
        }
        R.id.accountItem -> {
          // Checks if the user is logged in
          if (SessionManager.isSessionActive()) {
            ActivityNavigator.changeActivity(this, UserDashboardActivity::class.java)
          } else {
            ActivityNavigator.changeActivity(this, LoginActivity::class.java)
          }
          true
        }
        else -> false
      }
    }
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
    GPSManager.handlePermissionResult(requestCode, grantResults, this)
  }

  /**
   * On destroy
   *
   */
  override fun onDestroy() {
    super.onDestroy()
    GPSManager.stopLocationUpdates()
  }

}


