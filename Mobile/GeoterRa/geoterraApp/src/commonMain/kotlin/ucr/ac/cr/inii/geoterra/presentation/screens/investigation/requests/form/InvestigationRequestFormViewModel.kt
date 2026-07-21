package ucr.ac.cr.inii.geoterra.presentation.screens.investigation.requests.form

import cafe.adriel.voyager.core.model.screenModelScope
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import ucr.ac.cr.inii.geoterra.data.model.responses.InvestigationRequestRequest
import ucr.ac.cr.inii.geoterra.data.model.responses.InvestigationRequestResponse
import ucr.ac.cr.inii.geoterra.domain.location.LocationProvider
import ucr.ac.cr.inii.geoterra.domain.permissions.PermissionManager
import ucr.ac.cr.inii.geoterra.domain.repository.CantonRepositoryInterface
import ucr.ac.cr.inii.geoterra.domain.repository.DistrictRepositoryInterface
import ucr.ac.cr.inii.geoterra.domain.repository.InvestigationRequestsRepositoryInterface
import ucr.ac.cr.inii.geoterra.domain.repository.ProvinceRepositoryInterface
import ucr.ac.cr.inii.geoterra.presentation.base.BaseScreenModel
import ucr.ac.cr.inii.geoterra.presentation.components.common.SnackbarMessage
import ucr.ac.cr.inii.geoterra.presentation.components.common.SnackbarType

class InvestigationRequestFormViewModel(
	private val analysisRequestRepository: InvestigationRequestsRepositoryInterface,
	private val provincesRepository: ProvinceRepositoryInterface,
	private val cantonsRepository: CantonRepositoryInterface,
	private val districtsRepository: DistrictRepositoryInterface,
	private val requestToEdit: InvestigationRequestResponse? = null,
	private val locationProvider: LocationProvider,
	private val permissionManager: PermissionManager
) : BaseScreenModel<InvestigationRequestFormState>(InvestigationRequestFormState()) {
	private val requestId: String? = requestToEdit?.request_id

	init {
		loadProvinces()
		loadCantons()
		loadDistricts()
		requestToEdit?.let {
			_state.update { state ->
				state.copy(request = InvestigationRequestRequest.fromRemote(it))
			}
		}
	}

	private fun loadProvinces() {
		screenModelScope.launch {
			provincesRepository.getProvinces()
				.onSuccess { provinces ->
					_state.update { it.copy(availableProvinces = provinces) }
				}
				.onFailure {
					_state.update {
						it.copy(
							snackBarMessage = SnackbarMessage(
								"Error al cargar provincias",
								SnackbarType.ERROR
							)
						)
					}
				}
		}
	}

	private fun loadCantons() {
		screenModelScope.launch {
			cantonsRepository.getCantons()
				.onSuccess { cantons ->
					_state.update { it.copy(availableCantons = cantons) }
				}
				.onFailure {
					_state.update {
						it.copy(
							snackBarMessage = SnackbarMessage(
								"Error al cargar cantones",
								SnackbarType.ERROR
							)
						)
					}
				}
		}
	}

	private fun loadDistricts() {
		screenModelScope.launch {
			districtsRepository.getDistricts()
				.onSuccess { districts ->
					_state.update { it.copy(availableDistricts = districts) }
				}
				.onFailure {
					_state.update {
						it.copy(
							snackBarMessage = SnackbarMessage(
								"Error al cargar distritos",
								SnackbarType.ERROR
							)
						)
					}
				}
		}
	}

	fun onEvent(event: AnalysisFormEvent) {
		when (event) {
			is AnalysisFormEvent.ProvinceChanged -> {
				_state.update {
					it.copy(
						request = it.request.copy(
							province_snit_code = event.snitCode ?: 0,
							canton_snit_code = 0,
							district_snit_code = 0
						)
					)
				}
			}

			is AnalysisFormEvent.CantonChanged -> {
				_state.update {
					it.copy(
						request = it.request.copy(
							canton_snit_code = event.snitCode ?: 0,
							district_snit_code = 0
						)
					)
				}
			}

			is AnalysisFormEvent.DistrictChanged -> {
				_state.update {
					it.copy(
						request = it.request.copy(
							district_snit_code = event.snitCode ?: 0
						)
					)
				}
			}

			is AnalysisFormEvent.OwnerEmailChanged -> {
				_state.update { it.copy(request = it.request.copy(owner_email = event.value)) }
			}

			is AnalysisFormEvent.OwnerNameChanged -> {
				_state.update { it.copy(request = it.request.copy(owner_name = event.value)) }
			}

			is AnalysisFormEvent.OwnerPhoneChanged -> {
				_state.update { it.copy(request = it.request.copy(owner_phone_number = event.value)) }
			}

			is AnalysisFormEvent.UsageChanged -> {
				_state.update { it.copy(request = it.request.copy(current_usage = event.value)) }
			}

			is AnalysisFormEvent.TempChanged -> {
				_state.update { it.copy(request = it.request.copy(temperature_sensation = event.value)) }
			}

			is AnalysisFormEvent.BubblesChanged -> {
				_state.update { it.copy(request = it.request.copy(bubbles = event.value)) }
			}

			is AnalysisFormEvent.LatChanged -> {
				_state.update {
					it.copy(
						request = it.request.copy(
							latitude = event.value.toDoubleOrNull() ?: 0.0
						)
					)
				}
			}

			is AnalysisFormEvent.LonChanged -> {
				_state.update {
					it.copy(
						request = it.request.copy(
							longitude = event.value.toDoubleOrNull() ?: 0.0
						)
					)
				}
			}

			is AnalysisFormEvent.DetailsChanged -> {
				_state.update { it.copy(request = it.request.copy(details = event.value)) }
			}

			is AnalysisFormEvent.ExactAddressChanged -> {
				_state.update { it.copy(request = it.request.copy(exact_address = event.value)) }
			}

			is AnalysisFormEvent.RelationChanged -> {
				_state.update { it.copy(request = it.request.copy(relation_with_owner = event.value)) }
			}

			is AnalysisFormEvent.Submit -> {
				submitForm()
			}

			is AnalysisFormEvent.UseCurrentLocation -> {
				fetchCurrentLocation()
			}

			is AnalysisFormEvent.ShowSnackBar -> {
				_state.update { it.copy(snackBarMessage = event.message) }
			}

			is AnalysisFormEvent.ClearSnackBar -> {
				_state.update { it.copy(snackBarMessage = null) }
			}
		}
	}

	private fun submitForm() {
		if (!validateFields()) return
		_state.update { it.copy(isLoading = true, snackBarMessage = null) }

		screenModelScope.launch {
			val currentState = _state.value

			val currentRequest = currentState.request.copy(
				owner_name = currentState.request.owner_name.takeIf { it?.isNotBlank() ?: true },
				owner_email = currentState.request.owner_email.takeIf { it?.isNotBlank() ?: true },
				owner_phone_number = currentState.request.owner_phone_number.takeIf {
					it?.isNotBlank() ?: true
				}
			)

			val result = if (requestId != null) {
				analysisRequestRepository.updateRequest(requestId, currentRequest)
			} else {
				analysisRequestRepository.createRequest(currentRequest)
			}

			result
				.onSuccess {
					val successMsg = if (requestId != null) "Solicitud actualizada correctamente."
					else "Solicitud creada correctamente."
					_state.update {
						it.copy(
							isSuccess = true,
							isLoading = false,
							snackBarMessage = SnackbarMessage(successMsg, SnackbarType.SUCCESS)
						)
					}
				}
				.onFailure { e ->
					_state.update {
						it.copy(
							isLoading = false,
							snackBarMessage = SnackbarMessage(
								e.message ?: "Error al procesar la solicitud.",
								SnackbarType.ERROR
							)
						)
					}
				}
		}
	}

	private fun fetchCurrentLocation() {
		screenModelScope.launch {
			if (permissionManager.hasLocationPermission()) {
				locationProvider.observeLocation().firstOrNull()?.let { location ->
					_state.update {
						it.copy(
							request = it.request.copy(
								latitude = location.latitude,
								longitude = location.longitude
							)
						)
					}
				} ?: run {
					_state.update {
						it.copy(
							snackBarMessage = SnackbarMessage(
								"No se pudo obtener la ubicación actual.",
								SnackbarType.ERROR
							)
						)
					}
				}
			} else {
				_state.update {
					it.copy(
						snackBarMessage = SnackbarMessage(
							"Permiso de ubicación denegado.",
							SnackbarType.ERROR
						)
					)
				}
			}
		}
	}

	private fun validateFields(): Boolean {
		val errors = mutableMapOf<String, String>()
		val req = _state.value.request

		if (req.province_snit_code == 0) {
			errors["province"] = "Por favor, seleccione una provincia."
		}
		if (req.canton_snit_code == 0) {
			errors["canton"] = "Por favor, seleccione un cantón."
		}
		if (req.district_snit_code == 0) {
			errors["district"] = "Por favor, seleccione un distrito."
		}

		if (req.owner_email?.isNotBlank() == true) {
			val emailRegex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[a-z]+$".toRegex()
			if (!req.owner_email.matches(emailRegex)) {
				errors["email"] = "El correo electrónico no es válido."
			}
		}

		if (req.owner_phone_number?.isNotBlank() == true) {
			val phoneRegex = "^[0-9]{8}$|^[0-9]{4}[- ]?[0-9]{4}$".toRegex()
			req.owner_phone_number.trim().matches(phoneRegex).let {
				if (!it) {
					errors["phone"] = "Debe ser un número de teléfono válido."
				}
			}
		}

		if (req.latitude == 0.0 && req.longitude == 0.0) {
			errors["location"] = "Por favor, proporcione datos de ubicación."
		}

		_state.update { it.copy(fieldErrors = errors) }
		return errors.isEmpty()
	}

	fun clearSuccess() {
		_state.update { it.copy(isSuccess = false) }
	}
}