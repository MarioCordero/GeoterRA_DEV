package ucr.ac.cr.inii.geoterra.presentation.screens.map

import cafe.adriel.voyager.core.model.screenModelScope
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import ucr.ac.cr.inii.geoterra.domain.location.LocationProvider
import ucr.ac.cr.inii.geoterra.domain.permissions.PermissionManager
import ucr.ac.cr.inii.geoterra.domain.repository.ManifestationsRepositoryInterface
import ucr.ac.cr.inii.geoterra.presentation.base.BaseScreenModel

class MapViewModel(
  private val manifestationsRepository: ManifestationsRepositoryInterface,
  private val locationProvider: LocationProvider,
  private val permissionManager: PermissionManager
) : BaseScreenModel<MapState>(MapState()) {

  fun loadMapMarkers(regionId: UInt? = null) {
    screenModelScope.launch {
      _state.update { it.copy(isLoading = true) }

      manifestationsRepository.getManifestations(regionId)
        .onSuccess { data ->
          _state.update {
            it.copy(
              markers = data,
              isLoading = false
            )
          }
        }
        .onFailure { exception ->
          _state.update { it.copy(isLoading = false, snackBarMessage = exception.message) }
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
          it.copy(snackBarMessage = "Permiso de ubicación denegado")
        }
      }
    } else {
      observeUserLocation()
    }
  }

  fun selectLayer(layerId: String) {
    val layer = _state.value.availableLayers.find { it.id == layerId }
    layer?.let {
      _state.update { s -> s.copy(selectedLayerId = it.id) }
    }
  }

  fun toggleFilterModal() {
    _state.update { it.copy(isFilterModalVisible = !it.isFilterModalVisible) }
  }

  fun hideFilterModal() {
    _state.update { it.copy(isFilterModalVisible = false) }
  }

  fun toggleRegion(regionId: UInt) {
    _state.update { state ->
      val newSelected = if (state.selectedRegionId == regionId) null else regionId
      state.copy(selectedRegionId = newSelected)
    }
  }

  fun clearSelectedRegion() {
    _state.update { it.copy(selectedRegionId = null) }
  }

  fun applyFilters() {
    hideFilterModal()
    val currentState = state.value
    val newLayer = currentState.availableLayers.find { it.id == currentState.selectedLayerId }

    _state.update { it.copy(
      isFilterModalVisible = false,
      styleUrl = newLayer?.styleUrl ?: it.styleUrl
    )}
    loadMapMarkers(state.value.selectedRegionId)
  }
}