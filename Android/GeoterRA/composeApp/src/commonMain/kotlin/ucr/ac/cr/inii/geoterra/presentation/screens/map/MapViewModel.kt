package ucr.ac.cr.inii.geoterra.presentation.screens.map

// en src/commonMain/kotlin/.../map/presentation/MapViewModel.kt

import cafe.adriel.voyager.core.model.screenModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import ucr.ac.cr.inii.geoterra.data.model.remote.ManifestationRemote
import ucr.ac.cr.inii.geoterra.domain.repository.ManifestationsRepository
import ucr.ac.cr.inii.geoterra.presentation.base.BaseScreenModel

class MapViewModel(
  private val manifestationsRepository: ManifestationsRepository
) : BaseScreenModel<MapState>(MapState()) {
  
  init {
    loadMapMarkers()
  }
//
//  fun loadMapMarkers() {
//    screenModelScope.launch {
//      _state.update { it.copy(isLoading = true) }
//      try {
//        // Suponiendo que tu repositorio obtiene marcadores de una API
//        val response = manifestationsRepository.getManifestations("all")
//          .onSuccess { data ->
//            _state.update { it.copy(isLoading = false, markers = data) }
//          }
//          .onFailure { exception ->
//            _state.update { it.copy(isLoading = false, error = exception.message) }
//          }
//        if (response.isSuccess)
//        _state.update {
//          it.copy(isLoading = false, markers = response.getOrThrow())
//        }
//      } catch (e: Exception) {
//        _state.update {
//          it.copy(isLoading = false, error = "Error al cargar los marcadores")
//        }
//      }
//    }
//  }
//
//  fun onMarkerSelected(manifestationID: String) {
//    _state.update { it.copy(selectedManifestation = this.state.value.markers.find { it.id == manifestationID }) }
//  }
  
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
  
  fun onMarkerSelected(manifestationID: String) {
    _state.update { s ->
      s.copy(selectedManifestation = s.markers.find { it.id == manifestationID })
    }
  }
}