package ucr.ac.cr.inii.geoterra.presentation.screens.map

import cafe.adriel.voyager.core.model.screenModelScope
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlinx.datetime.Clock
import ucr.ac.cr.inii.geoterra.domain.location.LocationProvider
import ucr.ac.cr.inii.geoterra.domain.permissions.PermissionManager
import ucr.ac.cr.inii.geoterra.domain.repository.CantonRepositoryInterface
import ucr.ac.cr.inii.geoterra.domain.repository.DistrictRepositoryInterface
import ucr.ac.cr.inii.geoterra.domain.repository.ManifestationsRepositoryInterface
import ucr.ac.cr.inii.geoterra.domain.repository.ProvinceRepositoryInterface
import ucr.ac.cr.inii.geoterra.presentation.base.BaseScreenModel

/**
 * ViewModel that manages map interactions, layer selections, and hierarchical region filtering.
 */
class MapViewModel(
  private val manifestationsRepository: ManifestationsRepositoryInterface,
  private val provinceRepository: ProvinceRepositoryInterface,
  private val cantonRepository: CantonRepositoryInterface,
  private val districtRepository: DistrictRepositoryInterface,
  private val locationProvider: LocationProvider,
  private val permissionManager: PermissionManager
) : BaseScreenModel<MapState>(MapState()) {

  init {
    loadProvinces()
    loadCantons()
    loadDistricts()
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

  private fun loadCantons() {
    screenModelScope.launch {
      cantonRepository.getCantons()
        .onSuccess { cantons ->
          _state.update { it.copy(availableCantons = cantons) }
        }
        .onFailure {
          _state.update { it.copy(snackBarMessage = it.snackBarMessage) }
        }
    }
  }

  private fun loadDistricts() {
    screenModelScope.launch {
      districtRepository.getDistricts()
        .onSuccess { districts ->
          _state.update { it.copy(availableDistricts = districts) }
        }
        .onFailure {
          _state.update { it.copy(snackBarMessage = it.snackBarMessage) }
        }
    }
  }

  /**
   * Loads map markers filtered by hierarchical geographical criteria.
   *
   * @param provinceSnitCode The unique identifier for the selected province.
   * @param cantonSnitCode The unique identifier for the selected canton.
   * @param districtSnitCode The unique identifier for the selected district.
   */
  fun loadMapMarkers(
    provinceSnitCode: Int? = null,
    cantonSnitCode: Int? = null,
    districtSnitCode: Int? = null
  ) {
    screenModelScope.launch {
      _state.update { it.copy(isLoading = true) }
      _state.update { it.copy(isLoading = false) }
    }
  }

  fun onUserMarkerSelected() {
    _state.update {
      it.copy(
        selectedManifestation = null,
        isUserLocationSelected = true,
        userLocationTrigger = Clock.System.now().toEpochMilliseconds()
      )
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

  /**
   * Toggles the selection state of a map layer (adds if absent, removes if present).
   *
   * @param layerId The unique identifier of the style/WMS layer.
   */
  fun toggleLayer(layerId: String) {
    _state.update { currentState ->
      val currentSelected = currentState.selectedLayerIds
      val newSelected = if (currentSelected.contains(layerId)) {
        currentSelected - layerId
      } else {
        currentSelected + layerId
      }
      currentState.copy(selectedLayerIds = newSelected)
    }
  }

  fun toggleFilterModal() {
    _state.update { it.copy(isFilterModalVisible = !it.isFilterModalVisible) }
  }

  fun hideFilterModal() {
    _state.update { it.copy(isFilterModalVisible = false) }
  }

  /**
   * Updates the active province selection and resets down-hierarchy fields.
   *
   * @param snitCode The unique SNIT code of the chosen province.
   */
  fun selectProvince(snitCode: Int?) {
    _state.update { state ->
      val newSelected = if (state.selectedProvinceSnitCode == snitCode) null else snitCode
      state.copy(
        selectedProvinceSnitCode = newSelected,
        selectedCantonSnitCode = null,
        selectedDistrictSnitCode = null
      )
    }
  }

  /**
   * Updates the active canton selection and resets the down-hierarchy district selection.
   *
   * @param snitCode The unique SNIT code of the chosen canton.
   */
  fun selectCanton(snitCode: Int?) {
    _state.update { state ->
      val newSelected = if (state.selectedCantonSnitCode == snitCode) null else snitCode
      state.copy(
        selectedCantonSnitCode = newSelected,
        selectedDistrictSnitCode = null
      )
    }
  }

  /**
   * Updates the active district selection.
   *
   * @param snitCode The unique SNIT code of the chosen district.
   */
  fun selectDistrict(snitCode: Int?) {
    _state.update { state ->
      val newSelected = if (state.selectedDistrictSnitCode == snitCode) null else snitCode
      state.copy(selectedDistrictSnitCode = newSelected)
    }
  }

  /**
   * Resets all active filtering criteria, including hierarchical regions and selected map style layers.
   */
  fun clearAllFilters() {
    _state.update { state ->
      state.copy(
        selectedProvinceSnitCode = null,
        selectedCantonSnitCode = null,
        selectedDistrictSnitCode = null,
        selectedLayerIds = emptySet()
      )
    }
  }

  fun applyFilters() {
    hideFilterModal()

    _state.update { it.copy(
      isFilterModalVisible = false,
    )}

    loadMapMarkers(
      provinceSnitCode = state.value.selectedProvinceSnitCode,
      cantonSnitCode = state.value.selectedCantonSnitCode,
      districtSnitCode = state.value.selectedDistrictSnitCode
    )
  }
}