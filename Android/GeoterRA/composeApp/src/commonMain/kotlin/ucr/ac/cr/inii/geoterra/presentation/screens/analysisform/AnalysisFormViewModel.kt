package ucr.ac.cr.inii.geoterra.presentation.screens.analysisform

import cafe.adriel.voyager.core.model.screenModelScope
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import ucr.ac.cr.inii.geoterra.data.model.remote.AnalysisRequestDTO
import ucr.ac.cr.inii.geoterra.data.model.remote.AnalysisRequestRemote
import ucr.ac.cr.inii.geoterra.data.repository.AnalysisRequestRepository
import ucr.ac.cr.inii.geoterra.data.repository.RegionRepository
import ucr.ac.cr.inii.geoterra.domain.location.LocationProvider
import ucr.ac.cr.inii.geoterra.domain.permissions.PermissionManager
import ucr.ac.cr.inii.geoterra.domain.repository.AnalysisRequestRepositoryInterface
import ucr.ac.cr.inii.geoterra.domain.repository.RegionRepositoryInterface
import ucr.ac.cr.inii.geoterra.presentation.base.BaseScreenModel

class AnalysisFormViewModel(
  private val analysisRequestRepository: AnalysisRequestRepositoryInterface,
  private val regionRepository: RegionRepositoryInterface,
  private val requestToEdit: AnalysisRequestRemote? = null,
  private val locationProvider: LocationProvider,
  private val permissionManager: PermissionManager
) : BaseScreenModel<AnalysisFormState>(AnalysisFormState()) {

  init {
    requestToEdit?.let { request ->
      _state.update { currentState ->
        currentState.copy(
          regionId = request.region_id,
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
      is AnalysisFormEvent.RegionChanged -> _state.update { it.copy(regionId = event.value) }
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
      is AnalysisFormEvent.ShowSnackBar -> _state.update { it.copy(snackBarMessage = event.message) }
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
    _state.update { it.copy(
      email = it.email.trim(),
      temperatureSensation = it.temperatureSensation.trim(),
      ownerName = it.ownerName.trim(),
      ownerContact = it.ownerContact.trim(),
      details = it.details.trim()
    )}

    if (!validateFields()) return

    screenModelScope.launch {

      _state.update { it.copy(isLoading = true, snackBarMessage = null) }

      val currentState = _state.value
      val form = AnalysisRequestDTO(
        region = currentState.regionId.toString(),
        email = currentState.email,
        owner_name = currentState.ownerName.ifBlank { null },
        owner_contact_number = currentState.ownerContact.ifBlank { null },
        temperature_sensation = currentState.temperatureSensation,
        bubbles = currentState.bubbles,
        details = currentState.details.ifBlank { null },
        current_usage = currentState.currentUsage.ifBlank { null },
        latitude = currentState.latitude.toFloat(),
        longitude = currentState.longitude.toFloat()
      )

      val result = if (currentState.isEditing) {
        analysisRequestRepository.updateRequest(requestToEdit!!.id, form)
      } else {
        analysisRequestRepository.createRequest(form)
      }

      result.onSuccess {
        _state.update { it.copy(isSuccess = true, isLoading = false) }
      }.onFailure { e ->
        _state.update { it.copy(
          isLoading = false,
          error = e.message ?: "Error al procesar la solicitud."
        )}
      }
    }
  }

  private fun validateFields(): Boolean {
    val errors = mutableMapOf<String, String>()
    val s = _state.value

    if (s.regionId == null) errors["region"] = "Por favor, seleccione una región."

    val emailRegex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[a-z]+$".toRegex()
    if (s.email.isBlank()) {
      errors["email"] = "Por favor, proporcione un correo electrónico."
    } else if (!s.email.matches(emailRegex)) {
      errors["email"] = "El correo electrónico no es válido."
    }

    if (s.ownerContact.isNotBlank()) {
      val phoneRegex = "^[0-9]{8}$|^[0-9]{4}[- ]?[0-9]{4}$".toRegex()
      if (!s.ownerContact.trim().matches(phoneRegex)) {
        errors["phone"] = "Debe ser un número de teléfono válido."
      }
    }

    val lat = s.latitude.toFloatOrNull()
    val lon = s.longitude.toFloatOrNull()
    if (lat == null || lon == null || (lat == 0f && lon == 0f)) {
      errors["location"] = "Por favor, proporcione datos de ubicación."
    }

    if (s.temperatureSensation.isBlank()) {
      errors["temp"] = "Por favor, indique una sensación térmica."
    }

    _state.update { it.copy(fieldErrors = errors) }
    return errors.isEmpty()
  }

  fun clearError() = _state.update { it.copy(error = null) }

  fun clearSuccess() = _state.update { it.copy(isSuccess = false) }
}