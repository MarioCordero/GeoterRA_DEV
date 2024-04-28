package com.inii.geoterra.development

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.widget.Button
import android.widget.Toast
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.lifecycle.lifecycleScope
import com.google.android.material.bottomnavigation.BottomNavigationView
import kotlinx.coroutines.launch

class RequestActivity : AppCompatActivity() {
    private lateinit var locationService : LocationService

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_request)
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main)) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }

        val bottomNavigationView = findViewById<BottomNavigationView>(R.id.bottom_menu)
        bottomNavigationView.selectedItemId = R.id.dashboardItem

        bottomNavigationView.setOnItemSelectedListener { item ->
            when (item.itemId) {
                R.id.homeItem -> {
                    // Iniciar la actividad HomeActivity
                    changeActivity(MainActivity::class.java, this::class.java)
                    true
                }

                R.id.mapItem -> {
                    // Iniciar la actividad DashboardActivity
                    changeActivity(MapActivity::class.java, this::class.java)
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
        locationService = LocationService()
        val requestButton = findViewById<Button>(R.id.newRequestButton)
        requestButton.setOnClickListener { checkAppPermissions() }

    }

    private fun checkAppPermissions() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED
            && ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            //Permiso no aceptado en el momento.
            requestLocationPermission()
        } else {
            locationService.setUserLocationPermissions(true)
            lifecycleScope.launch {
                val result = locationService.getUserLocation(this@RequestActivity)
                Toast.makeText(this@RequestActivity, "Latitud ${result?.latitude}  y longitud ${result?.latitude}", Toast.LENGTH_SHORT).show()
                //Toast.makeText(this@RequestActivity,    "hoolaaaaa", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun requestLocationPermission() {
        if (ActivityCompat.shouldShowRequestPermissionRationale(this, Manifest.permission.ACCESS_FINE_LOCATION)) {
            // Decirle al usuario que necesia los permisos para funcionar la app y ahora el debe de activarlos el mismo
            Toast.makeText(this,    "Permisos rechazados", Toast.LENGTH_SHORT).show()
        } else {
            // No se han rechado los permisos y podemos activarlos por la ventana
            ActivityCompat.requestPermissions(this, arrayOf(Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION), 777)
        }
        Toast.makeText(this,    "Permisos rechazados por primera vez", Toast.LENGTH_SHORT).show()
    }

    override fun onRequestPermissionsResult(requestCode : Int,
                                            permissions : Array<out String>,
                                            grantResults : IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == 777) {
            if (grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                locationService.setUserLocationPermissions(true)
                lifecycleScope.launch {
                    val result = locationService.getUserLocation(this@RequestActivity)
                    if (result != null) {
                        Toast.makeText(this@RequestActivity,    "Latitud ${result.latitude}  y longitud ${result.latitude}", Toast.LENGTH_SHORT).show()
                    }
                }
            } else {
                // el permiso no ha sido aceptado
                locationService.setUserLocationPermissions(false)
                Toast.makeText(this,    "Permisos rechazados por primera vez", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun changeActivity(destinationActivity: Class<*>, currentActivity: Class<*>) {
        if (destinationActivity != currentActivity) {
            val intent = Intent(this, destinationActivity)
            startActivity(intent)
        }
    }

}



