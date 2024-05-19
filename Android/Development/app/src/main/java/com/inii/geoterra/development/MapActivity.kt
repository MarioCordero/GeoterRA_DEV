package com.inii.geoterra.development

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.preference.PreferenceManager
import android.util.Log
import android.view.MotionEvent
import android.widget.Toast
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.lifecycle.lifecycleScope
import com.google.android.material.bottomnavigation.BottomNavigationView
import com.inii.geoterra.development.Components.CustomInfoOnMarker
import kotlinx.coroutines.launch
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
    private val locationService = LocationService()
    private var isInfoWindowShown = false


    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_map)
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main)) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }

        val bottomNavigationView = findViewById<BottomNavigationView>(R.id.bottom_menu)
        bottomNavigationView.selectedItemId = R.id.mapItem

        bottomNavigationView.setOnItemSelectedListener { item ->
            when (item.itemId) {
                R.id.homeItem -> {
                    // Iniciar la actividad HomeActivity
                    changeActivity(MainActivity::class.java, this::class.java)
                    true
                }
                R.id.dashboardItem-> {
                    // Iniciar la actividad DashboardActivity
                    changeActivity(RequestActivity::class.java, this::class.java)
                    true
                }
                R.id.accountItem -> {
                    // Iniciar la actividad NotificationsActivity
                    changeActivity(LoginActivity::class.java, this::class.java)
                    true
                }
                else -> false
            }
        }
        checkAppPermissions()
        mapManager()
    }

     fun mapManager() {
        mapView = findViewById(R.id.MapView)

        Configuration.getInstance().load(this@MapActivity, PreferenceManager.getDefaultSharedPreferences(this@MapActivity));
        val compassOverlay = CompassOverlay(this, mapView)
        compassOverlay.enableCompass()
         compassOverlay.setCompassCenter(40F, 60F)
         mapView.getZoomController().setVisibility(CustomZoomButtonsController.Visibility.NEVER)
         mapView.setMultiTouchControls(false)

// Establecer los límites del área visible en el mapa


        with(mapView) { this.setTileSource(TileSourceFactory.MAPNIK)
            this.controller?.setZoom(18.0)
            this.zoomController?.setVisibility(CustomZoomButtonsController.Visibility.ALWAYS)
            this.setMultiTouchControls(true)
            this.overlays?.add(compassOverlay)

            lifecycleScope.launch{
                var userCoordenates = locationService.getUserLocation(this@MapActivity)
                Log.i("Lectura Coordenadas", "Se leyeron las coordenadas del usuario")
                if (userCoordenates != null) {
                    Log.i("MapView Test", "Si entraaa")
                    var userPosition = GeoPoint(userCoordenates.latitude, userCoordenates.longitude)
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

                }
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
    private fun checkAppPermissions() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED
            || ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED
            || ContextCompat.checkSelfPermission(this, Manifest.permission.INTERNET) != PackageManager.PERMISSION_GRANTED
            || ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_NETWORK_STATE) != PackageManager.PERMISSION_GRANTED) {

            requestLocationPermission()
        } else {

            locationService.setUserLocationPermissions(true)
            lifecycleScope.launch {
                val result = locationService.getUserLocation(this@MapActivity)
                Toast.makeText(this@MapActivity, "Latitud ${result?.latitude}  y longitud ${result?.longitude}", Toast.LENGTH_SHORT).show()
            }
        }
    }

    /**
     *
     */
    private fun requestLocationPermission() {
        if (ActivityCompat.shouldShowRequestPermissionRationale(this, Manifest.permission.ACCESS_FINE_LOCATION)) {
            // Decirle al usuario que necesia los permisos para funcionar la app y ahora el debe de activarlos el mismo
            Toast.makeText(this, "Permisos rechazados", Toast.LENGTH_SHORT).show()
        } else {
            // No se han rechado los permisos y podemos activarlos por la ventana
            ActivityCompat.requestPermissions(this, arrayOf(Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION, Manifest.permission.INTERNET, Manifest.permission.ACCESS_NETWORK_STATE), 777)
        }
    }

    /**
     *
     */
    override fun onRequestPermissionsResult(requestCode : Int,
                                            permissions : Array<out String>,
                                            grantResults : IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == 777) {
            if (grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED
                && grantResults[1] == PackageManager.PERMISSION_GRANTED
                && grantResults[2] == PackageManager.PERMISSION_GRANTED
                && grantResults[3] == PackageManager.PERMISSION_GRANTED) {

                locationService.setUserLocationPermissions(true)
                lifecycleScope.launch {
                    val result = locationService.getUserLocation(this@MapActivity)
                    if (result != null) {
                        Toast.makeText(this@MapActivity, "Latitud ${result.latitude}  y longitud ${result.longitude}", Toast.LENGTH_SHORT).show()
                    }
                }
            } else {
                // el permiso no ha sido aceptado
                locationService.setUserLocationPermissions(false)
                Toast.makeText(this, "Permisos rechazados por primera vez", Toast.LENGTH_SHORT).show()
            }
        }
    }

    fun changeActivity(destinationActivity: Class<*>, currentActivity: Class<*>) {
        if (destinationActivity != currentActivity) {
            val intent = Intent(this, destinationActivity)
            startActivity(intent)
        }
    }


}