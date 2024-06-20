import android.annotation.SuppressLint
import android.content.Context
import android.location.Location
import android.location.LocationListener
import android.location.LocationManager
import android.os.Bundle
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import android.content.pm.PackageManager
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

object GPSManager : LocationListener {

  private lateinit var locationManager: LocationManager
  private var currentLocation: Location? = null
  const val LOCATION_REQUEST_CODE = 1000
  private var isInitialized = false

  // Inicializa el servicio GPS
  fun initialize(context: Context) {
    if (ContextCompat.checkSelfPermission(context, android.Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
      ActivityCompat.requestPermissions(context as AppCompatActivity, arrayOf(android.Manifest.permission.ACCESS_FINE_LOCATION), LOCATION_REQUEST_CODE)
      return
    }
    locationManager = context.getSystemService(Context.LOCATION_SERVICE) as LocationManager
    startLocationUpdates()
  }

  @SuppressLint("MissingPermission")
  private fun startLocationUpdates() {
    locationManager.requestLocationUpdates(LocationManager.GPS_PROVIDER, 5000L, 10f, this)
    locationManager.requestLocationUpdates(LocationManager.NETWORK_PROVIDER, 5000L, 10f, this)
  }

  // Devuelve la última ubicación conocida
  fun getLastKnownLocation(): Location? {
    return currentLocation
  }

  fun isInitialiazed() : Boolean {
    return isInitialized
  }

  // Implementación del método de LocationListener para recibir actualizaciones de ubicación
  override fun onLocationChanged(location: Location) {
    currentLocation = location
  }

  override fun onStatusChanged(provider: String?, status: Int, extras: Bundle?) {
    // Implementar según sea necesario
  }

  override fun onProviderEnabled(provider: String) {
    // Implementar según sea necesario
  }

  override fun onProviderDisabled(provider: String) {
    // Implementar según sea necesario
  }

  fun handlePermissionResult(requestCode: Int, grantResults: IntArray, context: Context) {
    if (requestCode == LOCATION_REQUEST_CODE) {
      if (grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
        Toast.makeText(context, "Permiso de galería concedido", Toast.LENGTH_SHORT).show()
      } else {
        Toast.makeText(context, "Permiso de galería denegado", Toast.LENGTH_SHORT).show()
      }
    }
  }
}
