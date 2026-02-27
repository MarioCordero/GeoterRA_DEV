package ucr.ac.cr.inii.geoterra.presentation.screens.analysisform

import cafe.adriel.voyager.core.model.ScreenModel
import cafe.adriel.voyager.core.model.screenModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import ucr.ac.cr.inii.geoterra.data.model.remote.AnalysisRequestFormRemote
import ucr.ac.cr.inii.geoterra.data.model.remote.AnalysisRequestRemote
import ucr.ac.cr.inii.geoterra.domain.camera.CameraManager
import ucr.ac.cr.inii.geoterra.domain.location.LocationProvider
import ucr.ac.cr.inii.geoterra.domain.permissions.PermissionManager
import ucr.ac.cr.inii.geoterra.domain.repository.AnalysisRequestRepository

class AnalysisFormViewModel(
  private val repository: AnalysisRequestRepository,
  private val initialRequest: AnalysisRequestRemote? = null,
  private val cameraManager: CameraManager,
  private val locationProvider: LocationProvider,
  private val permissionManager: PermissionManager
) : ScreenModel {
  
  private val _state = MutableStateFlow(
    AnalysisFormState(
      isEditing = initialRequest != null,
      region = initialRequest?.region ?: "",
      email = initialRequest?.email ?: "",
      ownerName = initialRequest?.owner_name ?: "",
      ownerContact = initialRequest?.owner_contact_number ?: "",
      currentUsage = initialRequest?.current_usage ?: "",
      temperatureSensation = initialRequest?.temperature_sensation ?: "",
      bubbles = initialRequest?.bubbles == 1,
      details = initialRequest?.details ?: "",
      latitude = initialRequest?.latitude ?: "",
      longitude = initialRequest?.longitude ?: ""
    )
  )
  val state = _state.asStateFlow()
  
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
      is AnalysisFormEvent.TakePhoto -> takePhoto()
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
          _state.update { it.copy(error = "No se obtuvo señal GPS", isLoading = false) }
        }
      } else {
        _state.update { it.copy(error = "Permiso de ubicación denegado por el usuario") }
      }
    }
  }
  
  private fun submitForm() {
    screenModelScope.launch {
      _state.update { it.copy(isLoading = true, error = null) }
      
      val form = AnalysisRequestFormRemote(
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
        repository.updateRequest(initialRequest!!.id, form)
      } else {
        repository.createRequest(form)
      }
      
      result.onSuccess {
        _state.update { it.copy(isSuccess = true, isLoading = false) }
      }.onFailure { e ->
        _state.update { it.copy(error = e.message, isLoading = false) }
      }
    }
  }

  private fun takePhoto() {
    screenModelScope.launch {
      if (permissionManager.requestCameraPermission()) {
        val result = cameraManager.takePhotoWithLocation()
        result?.let { (bytes, location) ->
          // Priorizamos la ubicación incrustada en la captura
          _state.update { it.copy(
            latitude = location?.latitude?.toString() ?: it.latitude,
            longitude = location?.longitude?.toString() ?: it.longitude
          )}
          // Aquí podrías guardar los bytes de la foto si tu backend lo requiere
        }
      }
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
      _state.update { it.copy(error = "La imagen no contiene metadatos GPS") }
    }
  }
}