package com.inii.geoterra.development.Components

import android.annotation.SuppressLint
import android.content.Context
import android.location.Location
import android.location.LocationManager
import android.util.Log
import com.google.android.gms.location.LocationServices
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.suspendCancellableCoroutine

@OptIn(ExperimentalCoroutinesApi::class)
class LocationService {
  private var isUserLocationGranted: Boolean = false

  @SuppressLint("MissingPermission")
  suspend fun getUserLocation(context : Context): Location? {

    val fusedLocationProviderClient = LocationServices.getFusedLocationProviderClient(context)
    val locationManager = context.getSystemService(Context.LOCATION_SERVICE) as LocationManager
    val isGPSEnabled = locationManager.isProviderEnabled(LocationManager.NETWORK_PROVIDER)
            || locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER)

    if (!isGPSEnabled || !isUserLocationGranted) {
      Log.i("Verificacion de GPS Falla","isGPSEnabled: $isGPSEnabled, isUserLocationGranted: $isUserLocationGranted")
      return null
    }

    return suspendCancellableCoroutine { cont ->
      fusedLocationProviderClient.lastLocation.apply {
        if(isComplete) {
          if (isSuccessful) {
            cont.resume(result){}
          } else {
            cont.resume(null){}
          }
          return@suspendCancellableCoroutine
        }
        addOnSuccessListener {
          cont.resume(it){}
        }
        addOnFailureListener {
          cont.resume(null){}
        }
      }
    }
  }

  fun setUserLocationPermissions(userPermission : Boolean) {
    isUserLocationGranted = userPermission
    Log.i("setLocationPermissions","isUserLocationGranted: $isUserLocationGranted")
  }

}