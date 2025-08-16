package com.inii.geoterra.development.device

import android.Manifest
import android.annotation.SuppressLint
import android.content.Context
import android.content.pm.PackageManager
import android.location.Location
import android.location.LocationListener
import android.location.LocationManager
import android.os.Looper
import android.util.Log
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.inii.geoterra.development.interfaces.LocationCallbackListener
import com.inii.geoterra.development.interfaces.PermissionRequester
import timber.log.Timber
import javax.inject.Inject
import javax.inject.Singleton

/**
 * @brief GPSManager sin FusedLocation, usando LocationManager directamente.
 *
 * Emula comportamiento de FusedLocationProviderClient combinando proveedores
 * GPS y NETWORK para obtener ubicaciones precisas.
 */
@Singleton
class GPSManager @Inject constructor(): LocationListener {

  private val LOCATION_PERMISSION_REQUEST_CODE = 1000

  private val requiredPermission = Manifest.permission.ACCESS_FINE_LOCATION

  /** Instancia de LocationManager del sistema */
  private lateinit var locationManager: LocationManager

  /** Última ubicación conocida */
  private var currentLocation: Location? = null

  /** Flag de inicialización */
  private var isInitialized = false

  /** Flag de inicio de actualizaciones */
  private var started = false

  /** Intervalo mínimo de tiempo entre actualizaciones (en milisegundos) */
  private val MIN_TIME_MS: Long = 2000

  /** Distancia mínima en metros para actualizaciones */
  private val MIN_DISTANCE_M: Float = 1.5f

  // Internal list of registered listeners
  private val listeners = mutableListOf<LocationCallbackListener>()

  /**
   * Adds a new listener to receive location updates.
   *
   * @param listener The listener to register.
   */
  fun addLocationCallbackListener(listener: LocationCallbackListener) {
    if (!listeners.contains(listener)) {
      listeners.add(listener)
    }
  }

  /**
   * Removes a previously registered listener.
   *
   * @param listener The listener to unregister.
   */
  fun removeLocationCallbackListener(listener: LocationCallbackListener) {
    listeners.remove(listener)
  }

  /**
   * Clears all registered location listeners.
   */
  fun clearAllLocationListeners() {
    listeners.clear()
  }

  /**
   * Notifies all listeners with the updated location.
   *
   * @param location The new location.
   */
  private fun notifyLocationUpdated(location: Location) {
    listeners.forEach { it.onLocationUpdated(location) }
  }

  /**
   * Notifies all listeners that a provider has been enabled.
   *
   * @param provider The provider name.
   */
  private fun notifyProviderEnabled(provider: String) {
    listeners.forEach { it.onProviderEnabled(provider) }
  }

  /**
   * Notifies all listeners that a provider has been disabled.
   *
   * @param provider The provider name.
   */
  private fun notifyProviderDisabled(provider: String) {
    listeners.forEach { it.onProviderDisabled(provider) }
  }

  /**
   * Notifies listeners that the location service is unavailable.
   */
  private fun notifyLocationUnavailable() {
    listeners.forEach { it.onLocationUnavailable() }
  }

  /**
   * Notifies listeners of a location-related error.
   *
   * @param message Description of the error.
   */
  private fun notifyLocationError(message: String) {
    listeners.forEach { it.onLocationError(message) }
  }

  /**
   * Inicializa el GPSManager con los proveedores GPS y NETWORK.
   */
  fun initialize(permissionRequester: PermissionRequester) {
    val context = permissionRequester.getContext()
    if (hasLocationPermission(context)) {

      locationManager = context.getSystemService(Context.LOCATION_SERVICE)
        as LocationManager
      isInitialized = true
      startLocationUpdates()

      return
    }

    // Verificamos si se debe mostrar el racional de permiso
    val showRationale = permissionRequester.shouldShowRationale(requiredPermission)

    if (showRationale) {
      // Mostrar diálogo de explicación antes de solicitar permiso
      showRationaleDialog(context)
    }

    permissionRequester.requestPermission(
      arrayOf(requiredPermission),
      LOCATION_PERMISSION_REQUEST_CODE
    )
  }

  private fun showRationaleDialog(context : Context) {
    AlertDialog.Builder(context)
      .setTitle("Location Permission Required")
      .setMessage("This app needs access to your location. Please grant the permission.")
      .setNegativeButton("Cancel", null)
      .show()
  }

  /**
   * Verifica si el GPSManager está inicializado.
   */
  fun isInitialized(): Boolean {
    return this.isInitialized
  }

  /**
   * Inicia las actualizaciones de ubicación desde GPS y NETWORK.
   */
  @SuppressLint("MissingPermission")
  fun startLocationUpdates() {
    if (!this.isInitialized) {
      Timber.e("The gps was not initialized correctly")
      return
    }

    if (this.started) {
      Timber.w("The gps was already started")
      return
    }

    try {
      // Solicita ubicación desde GPS
      locationManager.requestLocationUpdates(
        LocationManager.GPS_PROVIDER,
        MIN_TIME_MS,
        MIN_DISTANCE_M,
        this,
        Looper.getMainLooper()
      )

      // Solicita ubicación desde NETWORK
      locationManager.requestLocationUpdates(
        LocationManager.NETWORK_PROVIDER,
        MIN_TIME_MS,
        MIN_DISTANCE_M,
        this,
        Looper.getMainLooper()
      )

      this.started = true
      Log.i("GPSManager", "Actualizaciones de ubicación iniciadas")
    } catch (e: Exception) {
      Log.e("GPSManager", "Error al iniciar actualizaciones: ${e.message}")
    }
  }

  /**
   * Detiene todas las actualizaciones de ubicación.
   */
  fun stopLocationUpdates() {
    if (!::locationManager.isInitialized || !this.started) return

    locationManager.removeUpdates(this)
    this.started = false
    Log.i("GPSManager", "Actualizaciones de ubicación detenidas")
  }

  /**
   * Callback invocado cuando se recibe una nueva ubicación.
   */
  override fun onLocationChanged(location: Location) {
    this.currentLocation = location
    Log.i("GPSManager", "Nueva ubicación: ${location.latitude}, ${location.longitude}")

    // Notifica tanto la última ubicación como la actualización
    listeners.forEach {
      it.onLocationReady(location)
      it.onLocationUpdated(location)
    }
  }


  /**
   * Retorna la última ubicación conocida.
   */
  fun getLastKnownLocation(): Location? {
    if (!::locationManager.isInitialized) return null

    val gpsLocation = try {
      locationManager.getLastKnownLocation(LocationManager.GPS_PROVIDER)
    } catch (e: SecurityException) {
      null
    }

    val netLocation = try {
      locationManager.getLastKnownLocation(LocationManager.NETWORK_PROVIDER)
    } catch (e: SecurityException) {
      null
    }

    // Elige la más reciente entre ambas
    return listOfNotNull(gpsLocation, netLocation).maxByOrNull { it.time }
  }

  /**
   * Verifica si se tienen permisos de ubicación.
   */
  private fun hasLocationPermission(context: Context): Boolean {
    return ContextCompat.checkSelfPermission(
      context, requiredPermission
    ) == PackageManager.PERMISSION_GRANTED
  }

  /**
   * Solicita permiso de ubicación al usuario.
   */
  private fun requestLocationPermission(context: Context) {
    ActivityCompat.requestPermissions(
      context as AppCompatActivity,
      arrayOf(requiredPermission),
      LOCATION_PERMISSION_REQUEST_CODE
    )
    Log.w("GPSManager", "Permiso de ubicación solicitado")
  }

  /**
   * Maneja el resultado de la solicitud de permisos.
   */
  fun handlePermissionResult(
    requestCode: Int,
    grantResults: IntArray,
    permissionRequester: PermissionRequester
  ) {
    if (requestCode == LOCATION_PERMISSION_REQUEST_CODE) {
      if (grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
        Toast.makeText(permissionRequester.getContext(), "Permiso de ubicación concedido", Toast.LENGTH_SHORT).show()
        initialize(permissionRequester)
      } else {
        Toast.makeText(permissionRequester.getContext(), "Permiso de ubicación denegado", Toast.LENGTH_SHORT).show()
      }
    }
  }
}
