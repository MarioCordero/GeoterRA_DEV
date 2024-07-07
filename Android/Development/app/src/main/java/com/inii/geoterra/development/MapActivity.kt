package com.inii.geoterra.development

import com.inii.geoterra.development.components.GPSManager
import android.os.Bundle
import android.preference.PreferenceManager
import android.util.Log
import android.view.MotionEvent
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import com.google.android.material.bottomnavigation.BottomNavigationView
import com.inii.geoterra.development.components.ActivityNavigator
import com.inii.geoterra.development.components.CustomInfoOnMarker
import org.osmdroid.config.Configuration
import org.osmdroid.tileprovider.tilesource.TileSourceFactory
import org.osmdroid.util.GeoPoint
import org.osmdroid.views.CustomZoomButtonsController
import org.osmdroid.views.MapView
import org.osmdroid.views.overlay.Marker
import org.osmdroid.views.overlay.compass.CompassOverlay

class MapActivity : AppCompatActivity() {
    private lateinit var mapView : MapView
    private lateinit var userMarker : Marker
    private var isInfoWindowShown = false


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
        mapManager()
    }

     fun mapManager() {
        mapView = findViewById(R.id.MapView)

        Configuration.getInstance().load(this@MapActivity, PreferenceManager.getDefaultSharedPreferences(this@MapActivity));
        val compassOverlay = CompassOverlay(this, mapView)
        compassOverlay.enableCompass()
         compassOverlay.setCompassCenter(40F, 60F)
         mapView.zoomController.setVisibility(CustomZoomButtonsController.Visibility.SHOW_AND_FADEOUT)
         mapView.setMultiTouchControls(false)

         val userCoordenates = GPSManager.getLastKnownLocation()
         // Establece lops limites de long y lat del mapa
        with(mapView) { this.setTileSource(TileSourceFactory.MAPNIK)
            this.controller?.setZoom(18.0)
            this.zoomController?.setVisibility(CustomZoomButtonsController.Visibility.ALWAYS)
            this.setMultiTouchControls(true)
            this.overlays?.add(compassOverlay)

            Log.i("Lectura Coordenadas", "Se leyeron las coordenadas del usuario")
            if (userCoordenates != null) {
                Log.i("MapView Test", "Si entraaa")
                val userPosition = GeoPoint(userCoordenates.latitude, userCoordenates.longitude)
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

         mapView.setOnTouchListener { v, event ->
             when (event.action) {
                 MotionEvent.ACTION_MOVE -> {
                     val center = mapView.mapCenter
                     val latitude = center.latitude
                     val longitude = center.longitude

                     // Definir los límites del área visible para Costa Rica
                     val minLat = 8.0
                     val maxLat = 11.25
                     val minLon = -86.0
                     val maxLon = -82.5

                     // Verificar si la posición del mapa está fuera de los límites
                     val newLatitude = latitude.coerceIn(minLat, maxLat)
                     val newLongitude = longitude.coerceIn(minLon, maxLon)

                     // Si la posición está fuera de los límites, ajustar la posición del mapa
                     if (latitude != newLatitude || longitude != newLongitude) {
                         mapView.controller.animateTo(GeoPoint(newLatitude, newLongitude))
                         true // Indicar que se ha manejado el evento de desplazamiento
                     } else {
                         false // Permitir el desplazamiento normal del mapa
                     }
                 }
                 else -> false
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
}