package ucr.ac.cr.inii.geoterra.presentation.screens.map

// en src/commonMain/kotlin/.../map/presentation/MapViewModel.kt

import cafe.adriel.voyager.core.model.screenModelScope
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import ucr.ac.cr.inii.geoterra.domain.location.LocationProvider
import ucr.ac.cr.inii.geoterra.domain.permissions.PermissionManager
import ucr.ac.cr.inii.geoterra.domain.repository.ManifestationsRepository
import ucr.ac.cr.inii.geoterra.presentation.base.BaseScreenModel

class MapViewModel(
  private val manifestationsRepository: ManifestationsRepository,
  private val locationProvider: LocationProvider,
  private val permissionManager: PermissionManager
) : BaseScreenModel<MapState>(MapState()) {
  
  init {
    loadMapMarkers()
  }
  
  fun loadMapMarkers() {
    screenModelScope.launch {
      _state.update { it.copy(isLoading = true) }
      
      manifestationsRepository.getManifestations("all")
        .onSuccess { data ->
          _state.update { it.copy(isLoading = false, markers = data, error = null) }
        }
        .onFailure { exception ->
          _state.update { it.copy(isLoading = false, error = exception.message) }
        }
    }
  }
  
  fun onUserMarkerSelected() {
    _state.update { it.copy(selectedManifestation = null, isUserLocationSelected = true) }
  }
  
  fun onManifestationMarkerSelected(manifestationID: String) {
    _state.update { s ->
      s.copy(isUserLocationSelected = false, selectedManifestation = s.markers.find { it.id == manifestationID })
    }
  }
  
  private fun observeUserLocation() {
    screenModelScope.launch {
      locationProvider.observeLocation()
        .collect { location ->
          println("Latitud: ${location.latitude}, Longitud: ${location.longitude}")
          _state.update {
            it.copy(userLocation = location)
          }
        }
    }
  }
  
  suspend fun requestLocationIfNeeded() {
    if (!permissionManager.hasLocationPermission()) {
      
      val granted = permissionManager.requestLocationPermission()
      
      if (granted) {
        observeUserLocation()
      } else {
        _state.update {
          it.copy(error = "Permiso de ubicación denegado")
        }
      }
    } else {
      observeUserLocation()
    }
  }
}