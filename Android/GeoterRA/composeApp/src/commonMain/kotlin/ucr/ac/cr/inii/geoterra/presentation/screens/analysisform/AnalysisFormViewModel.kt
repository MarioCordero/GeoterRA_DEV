package ucr.ac.cr.inii.geoterra.presentation.screens.analysisform

import cafe.adriel.voyager.core.model.screenModelScope
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import ucr.ac.cr.inii.geoterra.data.model.remote.AnalysisRequestDTO
import ucr.ac.cr.inii.geoterra.data.model.remote.AnalysisRequestRemote
import ucr.ac.cr.inii.geoterra.domain.camera.CameraManager
import ucr.ac.cr.inii.geoterra.domain.location.LocationProvider
import ucr.ac.cr.inii.geoterra.domain.permissions.PermissionManager
import ucr.ac.cr.inii.geoterra.domain.repository.AnalysisRequestRepository
import ucr.ac.cr.inii.geoterra.presentation.base.BaseScreenModel

class AnalysisFormViewModel(
  private val repository: AnalysisRequestRepository,
  private val requestToEdit: AnalysisRequestRemote? = null,
  private val cameraManager: CameraManager,
  private val locationProvider: LocationProvider,
  private val permissionManager: PermissionManager
) : BaseScreenModel<AnalysisFormState>(AnalysisFormState()) {

  init {
    // SOLUCIÓN: Si initialRequest no es nulo, cargamos sus datos en el estado
    requestToEdit?.let { request ->
      _state.update { currentState ->
        currentState.copy(
          region = request.regionName(),
          email = request.email,
          ownerName = request.owner_name ?: "",
          ownerContact = request.owner_contact_number ?: "",
          temperatureSensation = request.temperature_sensation ?: "",
          bubbles = request.bubbles ?: 0,
          details = request.details ?: "",
          currentUsage = request.current_usage ?: "",
          latitude = request.latitude,
          longitude = request.longitude,
          isEditing = true
        )
      }
    }
  }

  fun dismissSnackBar() = _state.update { it.copy(snackBarMessage = null) }
  
  fun onEvent(event: AnalysisFormEvent) {
    when (event) {
      is AnalysisFormEvent.RegionChanged -> _state.update { it.copy(region = event.value) }
      is AnalysisFormEvent.EmailChanged -> _state.update { it.copy(email = event.value) }
      is AnalysisFormEvent.OwnerNameChanged -> _state.update { it.copy(ownerName = event.value) }
      is AnalysisFormEvent.OwnerContactChanged -> _state.update { it.copy(ownerContact = event.value) }
      is AnalysisFormEvent.UsageChanged -> _state.update { it.copy(currentUsage = event.value) }
      is AnalysisFormEvent.TempChanged -> _state.update { it.copy(temperatureSensation = event.value) }
      is AnalysisFormEvent.BubblesChanged -> _state.update { it.copy(bubbles = event.value) }
      is AnalysisFormEvent.LatChanged -> _state.update { it.copy(latitude = event.value) }
      is AnalysisFormEvent.LonChanged -> _state.update { it.copy(longitude = event.value) }
      is AnalysisFormEvent.DetailsChanged -> _state.update { it.copy(details = event.value) }
      is AnalysisFormEvent.Submit -> submitForm()
      is AnalysisFormEvent.UseCurrentLocation -> fetchCurrentLocation()
      is AnalysisFormEvent.PickPhoto -> pickPhoto()
      is AnalysisFormEvent.PhotoCaptured -> processPhoto(event.bytes)
    }
  }

  private fun fetchCurrentLocation() {
    screenModelScope.launch {
      if (permissionManager.requestLocationPermission()) {
        _state.update { it.copy(isLoading = true) }
        val location = locationProvider.observeLocation().firstOrNull()
        if (location != null) {
          _state.update {
            it.copy(
              latitude = location.latitude.toString(),
              longitude = location.longitude.toString(),
              isLoading = false
            )
          }
        } else {
          _state.update { it.copy(snackBarMessage = "No se obtuvo señal GPS", isLoading = false) }
        }
      } else {
        _state.update { it.copy(snackBarMessage = "Permiso de ubicación denegado por el usuario") }
      }
    }
  }
  
  private fun submitForm() {
    screenModelScope.launch {
      _state.update { it.copy(isLoading = true, snackBarMessage = null) }
      
      val form = AnalysisRequestDTO(
        region = _state.value.region,
        email = _state.value.email,
        owner_name = _state.value.ownerName.ifBlank { null },
        owner_contact_number = _state.value.ownerContact.ifBlank { null },
        temperature_sensation = _state.value.temperatureSensation.ifBlank { null },
        bubbles = _state.value.bubbles,
        details = _state.value.details.ifBlank { null },
        current_usage = _state.value.currentUsage.ifBlank { null },
        latitude = _state.value.latitude.toFloatOrNull() ?: 0f,
        longitude = _state.value.longitude.toFloatOrNull() ?: 0f
      )
      
      val result = if (_state.value.isEditing) {
        repository.updateRequest(requestToEdit!!.id, form)
      } else {
        repository.createRequest(form)
      }
      
      result.onSuccess {
        _state.update { it.copy(isSuccess = true, isLoading = false) }
      }.onFailure { e ->
        _state.update { it.copy(isLoading = false, error = e.message) }      }
    }
  }

  fun clearError() = _state.update { it.copy(error = null) }

  fun clearSuccess() = _state.update { it.copy(isSuccess = false) }
  
  fun pickPhoto() {
    screenModelScope.launch {
      _state.update { it.copy(isLoading = true, snackBarMessage = null) }
      
      if (!permissionManager.requestGalleryPermission()) {
        _state.update { it.copy(isLoading = false, snackBarMessage = "Permiso de galería denegado") }
        return@launch
      }
      
      val bytes = cameraManager.pickPhotoFromGallery()
      
      if (bytes != null) {
        val location = cameraManager.extractLocationFromCache(bytes)
        
        if (location != null) {
          _state.update { it.copy(
            latitude = location.latitude.toString(),
            longitude = location.longitude.toString(),
            isLoading = false,
            snackBarMessage = null
          )}
        } else {
          _state.update { it.copy(
            isLoading = false,
            snackBarMessage = "La foto no tiene GPS. Asegúrate de que la cámara tenga activada la ubicación."
          )}
        }
      } else {
        _state.update { it.copy(isLoading = false) }
      }
    }
  }
  
  private fun takePhoto() {
    screenModelScope.launch {
      _state.update { it.copy(isLoading = true, snackBarMessage = null) }

      val location = locationProvider.observeLocation().firstOrNull()

      val cameraGranted = permissionManager.requestCameraPermission()
      if (!cameraGranted) {
        _state.update { it.copy(isLoading = false, snackBarMessage = "Permiso de cámara denegado") }
        return@launch
      }
      
      val galleryGranted = permissionManager.requestGalleryPermission()
      if (!galleryGranted) {
        _state.update { it.copy(isLoading = false, snackBarMessage = "Permiso de galería denegado") }
        return@launch
      }
      
      permissionManager.requestLocationPermission()

      val result = cameraManager.takePhotoWithLocation(location ?: return@launch)
      
      result?.let { (bytes, location) ->
        _state.update { it.copy(
          isLoading = false,
          latitude = location?.latitude?.toString() ?: it.latitude,
          longitude = location?.longitude?.toString() ?: it.longitude
        )}
      } ?: _state.update { it.copy(isLoading = false) }
    }
  }

  private fun processPhoto(bytes: ByteArray) {
    val location = cameraManager.extractLocationFromCache(bytes)
    if (location != null) {
      _state.update { it.copy(
        latitude = location.latitude.toString(),
        longitude = location.longitude.toString()
      )}
    } else {
      _state.update { it.copy(snackBarMessage = "La imagen no contiene metadatos GPS") }
    }
  }
}