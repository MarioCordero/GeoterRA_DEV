package com.inii.geoterra.development

import android.content.Context
import android.os.Bundle
import android.util.Log
import android.widget.Button
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.lifecycle.lifecycleScope
import com.google.android.material.bottomnavigation.BottomNavigationView
import com.inii.geoterra.development.components.ActivityNavigator
import com.inii.geoterra.development.components.CustomInfoOnMarker
import com.inii.geoterra.development.components.api.RetrofitClient
import com.inii.geoterra.development.components.api.ThermalPoint
import com.inii.geoterra.development.components.services.GPSManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.locationtech.proj4j.CRSFactory
import org.locationtech.proj4j.CoordinateTransformFactory
import org.locationtech.proj4j.ProjCoordinate
import org.osmdroid.config.Configuration
import org.osmdroid.tileprovider.tilesource.TileSourceFactory
import org.osmdroid.util.GeoPoint
import org.osmdroid.views.CustomZoomButtonsController
import org.osmdroid.views.MapView
import org.osmdroid.views.overlay.Marker
import org.osmdroid.views.overlay.compass.CompassOverlay
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class MapActivity : AppCompatActivity() {
    private lateinit var mapView : MapView
    private lateinit var userMarker : Marker
    private var isInfoWindowShown = false
    private var ThermalPoints: MutableMap<String, GeoPoint> = mutableMapOf()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_map)
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.mapLayout)) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }

        if (!GPSManager.isInitialized()) {
            GPSManager.initialize(this)
        }

        val bottomNavigationView = findViewById<BottomNavigationView>(R.id.bottom_menu)
        bottomNavigationView.selectedItemId = R.id.mapItem

        bottomNavigationView.setOnItemSelectedListener { item ->
            when (item.itemId) {
                R.id.homeItem -> {
                    // Iniciar la actividad HomeActivity
                    ActivityNavigator.changeActivity(this, MainActivity::class.java)
                    true
                }
                R.id.dashboardItem-> {
                    // Iniciar la actividad RequestActivity
                    ActivityNavigator.changeActivity(this, RequestActivity::class.java)
                    true
                }
                R.id.accountItem -> {
                    // Iniciar la actividad NotificationsActivity
                    ActivityNavigator.changeActivity(this, LoginActivity::class.java)
                    true
                }
                else -> false
            }
        }

        val centerMapOnUserButton = findViewById<Button>(R.id.centerUserButton)
        centerMapOnUserButton.setOnClickListener{
            mapView.controller.setCenter(userMarker.position)
        }
        requestPoints()
        mapManager()
    }

    private fun mapManager() {
        mapView = findViewById(R.id.MapView)

        // Usar la nueva forma de obtener SharedPreferences
        val sharedPreferences = this.getSharedPreferences("map_preferences", Context.MODE_PRIVATE)
        Configuration.getInstance().load(this@MapActivity, sharedPreferences)

        val compassOverlay = CompassOverlay(this, mapView)
        compassOverlay.enableCompass()
        compassOverlay.setCompassCenter(40F, 60F)
        mapView.zoomController.setVisibility(CustomZoomButtonsController.Visibility.SHOW_AND_FADEOUT)
        mapView.setMultiTouchControls(false)

        val userCoordinates = GPSManager.getLastKnownLocation()
        // Establece los límites de longitud y latitud del mapa
        with(mapView) {
            this.setTileSource(TileSourceFactory.MAPNIK)
            this.controller?.setZoom(18.0)
            this.zoomController?.setVisibility(CustomZoomButtonsController.Visibility.ALWAYS)
            this.setMultiTouchControls(true)
            this.overlays?.add(compassOverlay)

            Log.i("Lectura Coordenadas", "Se leyeron las coordenadas del usuario")
            if (userCoordinates != null) {
                Log.i("MapView Test", "Si entraaa")
                val userPosition = GeoPoint(userCoordinates.latitude, userCoordinates.longitude)
                mapView.controller.setCenter(userPosition)

                userMarker = Marker(mapView)
                userMarker.position = userPosition
                userMarker.setAnchor(Marker.ANCHOR_CENTER, Marker.ANCHOR_BOTTOM)
                mapView.overlays.add(userMarker)

                val infoWindow = CustomInfoOnMarker(R.layout.custom_info_on_marker, mapView)
                userMarker.infoWindow = infoWindow

                // Manejar clics en los marcadores
                userMarker.setOnMarkerClickListener { marker, mapView ->
                    // Abrir la ventana de información cuando se hace clic en el marcador
                    if (!isInfoWindowShown) {
                        infoWindow.open(marker, marker.position, 0, -150)
                        isInfoWindowShown = true
                    } else {
                        userMarker.closeInfoWindow()
                        isInfoWindowShown = false
                    }
                    true // Indicar que el clic ha sido manejado
                }
            } else {
                Log.i("Coordenadas Vacias", "El valor de retorno es null")
            }
        }

    }

    private fun requestPoints() {
        lifecycleScope.launch(Dispatchers.IO) {
            try {
                withContext(Dispatchers.Main) {
                    val apiService = RetrofitClient.getAPIService()
                    val call = apiService.getMapPoints("Guanacaste")
                    call.enqueue(object : Callback<List<ThermalPoint>> {
                        override fun onResponse(call : Call<List<ThermalPoint>>,
                                                response : Response<List<ThermalPoint>>) {
                            if (response.isSuccessful) {
                                val mapPoints = response.body()
                                if (mapPoints != null) {
                                    Log.i("MapPoints", "Extrayendo los datos de respuesta")
                                    createThermalMarkers(mapPoints)
                                }
                            }
                        }

                        override fun onFailure(call : Call<List<ThermalPoint>>, t : Throwable) {
                            Log.i("Mapa", "Error en la consulta de puntos, $t")
                        }
                    })
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    Log.i("Error", "no se inicio el hilo")
                }
            }
        }
    }

    private fun createThermalMarkers(points : List<ThermalPoint>) {
        // Iterar sobre la lista de puntos termales y crear marcadores
        for (point in points) {
            val geoPoint = convertCRT05toWGS84(point.latitude, point.longitude)
            Log.i("coordenates", "${geoPoint.latitude}, ${geoPoint.longitude}")
            this.ThermalPoints[point.pointID] = geoPoint
        }
        //mapView.controller.setCenter(ThermalPoints["Termal CTP-1"])
    }

    private fun convertCRT05toWGS84(x: Double, y: Double): GeoPoint {
        val crsFactory = CRSFactory()
        val transformFactory = CoordinateTransformFactory()

        // Definir los sistemas de coordenadas origen y destino
        val sourceCRS = crsFactory.createFromName("EPSG:5367") // Reemplaza XXXXX con el código EPSG del sistema CRT05
        val targetCRS = crsFactory.createFromName("EPSG:4326") // EPSG:4326 es el código para WGS84

        // Crear la transformación
        val transform = transformFactory.createTransform(sourceCRS, targetCRS)

        // Definir las coordenadas de origen y destino
        val srcCoord = ProjCoordinate(x, y)
        val dstCoord = ProjCoordinate()

        // Realizar la transformación
        transform.transform(srcCoord, dstCoord)
        val normalizedCoor = GeoPoint(dstCoord.y, dstCoord.x)

        return normalizedCoor
    }

    private fun showThermalMarkers(thermalPoints: MutableMap<String, GeoPoint>) {
        lifecycleScope.launch(Dispatchers.IO) {
            try {
                withContext(Dispatchers.Main) {
                    for (point in thermalPoints) {
                        val thermalMarker = Marker(mapView).apply {
                            position = point.value
                            title = point.key
                        }
                        mapView.overlays.add(thermalMarker)
                    }
                    mapView.invalidate()
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    Log.i("Error", "Failed to load thermal markers")
                    // Consider showing user feedback (toast, dialog)
                }
            }
        }
    }

    /**
     *
     */
    override fun onRequestPermissionsResult(requestCode : Int,
                                            permissions : Array<out String>,
                                            grantResults : IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        GPSManager.handlePermissionResult(requestCode, grantResults, this)
    }

    override fun onDestroy() {
        super.onDestroy()
        GPSManager.stopLocationUpdates()
    }
}