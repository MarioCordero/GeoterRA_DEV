package ucr.ac.cr.inii.geoterra.presentation.screens.map

import cafe.adriel.voyager.core.model.screenModelScope
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlinx.datetime.Clock
import ucr.ac.cr.inii.geoterra.domain.location.LocationProvider
import ucr.ac.cr.inii.geoterra.domain.permissions.PermissionManager
import ucr.ac.cr.inii.geoterra.domain.repository.ManifestationsRepositoryInterface
import ucr.ac.cr.inii.geoterra.domain.repository.ProvinceRepositoryInterface
import ucr.ac.cr.inii.geoterra.presentation.base.BaseScreenModel

class MapViewModel(
  private val manifestationsRepository: ManifestationsRepositoryInterface,
  private val provinceRepository: ProvinceRepositoryInterface,
  private val locationProvider: LocationProvider,
  private val permissionManager: PermissionManager
) : BaseScreenModel<MapState>(MapState()) {
  init {
    loadProvinces()
  }

  private fun loadProvinces() {
    screenModelScope.launch {
      provinceRepository.getProvinces()
        .onSuccess { provinces ->
          _state.update { it.copy(availableProvinces = provinces) }
        }
        .onFailure {
          _state.update { it.copy(snackBarMessage = it.snackBarMessage) }
        }
    }
  }

  fun loadMapMarkers(provinceSnitCode: Int? = null) {
    screenModelScope.launch {
      _state.update { it.copy(isLoading = true) }

//      manifestationsRepository.getManifestations(regionId)
//        .onSuccess { data ->
//          _state.update {
//            it.copy(
//              markers = data,
//              isLoading = false
//            )
//          }
//        }
//        .onFailure { exception ->
//          _state.update { it.copy(isLoading = false, snackBarMessage = exception.message) }
//        }
    }
  }
  
  fun onUserMarkerSelected() {
    _state.update {
      it.copy(
        selectedManifestation = null,
        isUserLocationSelected = true,
        userLocationTrigger = Clock.System.now().toEpochMilliseconds())
    }
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
    val layer = _state.value.availableStyleLayers.find { it.id == layerId }
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

  fun toggleProvince(snitCode: Int) {
    _state.update { state ->
      val newSelected = if (state.selectedProvinceSnitCode == snitCode) null else snitCode
      loadMapMarkers(newSelected)
      state.copy(selectedProvinceSnitCode = newSelected)
    }
  }

  fun clearSelectedProvince() {
    _state.update { it.copy(selectedProvinceSnitCode = null) }
  }

  fun applyFilters() {
    hideFilterModal()
    val currentState = state.value
    val newLayer = currentState.availableStyleLayers.find { it.id == currentState.selectedLayerId }

    _state.update { it.copy(
      isFilterModalVisible = false,
      styleUrl = newLayer?.styleUrl ?: it.styleUrl
    )}
    loadMapMarkers(state.value.selectedProvinceSnitCode)
  }
}