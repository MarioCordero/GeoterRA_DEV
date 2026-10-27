package ucr.ac.cr.inii.geoterra.presentation.screens.field.trip.form

import cafe.adriel.voyager.core.model.screenModelScope
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import ucr.ac.cr.inii.geoterra.data.model.requests.FieldTripRequest
import ucr.ac.cr.inii.geoterra.data.model.responses.FieldTripResponse
import ucr.ac.cr.inii.geoterra.domain.repository.CantonRepositoryInterface
import ucr.ac.cr.inii.geoterra.domain.repository.DistrictRepositoryInterface
import ucr.ac.cr.inii.geoterra.domain.repository.FieldTripRepositoryInterface
import ucr.ac.cr.inii.geoterra.domain.repository.ProvinceRepositoryInterface
import ucr.ac.cr.inii.geoterra.domain.repository.UserRepositoryInterface
import ucr.ac.cr.inii.geoterra.presentation.base.BaseScreenModel
import ucr.ac.cr.inii.geoterra.presentation.components.common.SnackbarMessage
import ucr.ac.cr.inii.geoterra.presentation.components.common.SnackbarType

class FieldTripFormViewModel(
	private val fieldTripRepository: FieldTripRepositoryInterface,
	private val provincesRepository: ProvinceRepositoryInterface,
	private val cantonsRepository: CantonRepositoryInterface,
	private val districtsRepository: DistrictRepositoryInterface,
	private val userRepository: UserRepositoryInterface,
	private val fieldTripToEdit: FieldTripResponse? = null
) : BaseScreenModel<FieldTripFormState>(FieldTripFormState()) {
	private val fieldTripId: String? = fieldTripToEdit?.field_trip_id

	init {
		loadProvinces()
		loadCantons()
		loadDistricts()
		loadUsers()
		fieldTripToEdit?.let {
			_state.update { state ->
				state.copy(request = FieldTripRequest.fromRemote(it))
			}
		}
	}

	private fun loadProvinces() {
		screenModelScope.launch {
			provincesRepository.getProvinces()
				.onSuccess { provinces -> _state.update { it.copy(availableProvinces = provinces) } }
				.onFailure { _state.update { it.copy(snackBarMessage = SnackbarMessage("Error al cargar provincias", SnackbarType.ERROR)) } }
		}
	}

	private fun loadCantons() {
		screenModelScope.launch {
			cantonsRepository.getCantons()
				.onSuccess { cantons -> _state.update { it.copy(availableCantons = cantons) } }
				.onFailure { _state.update { it.copy(snackBarMessage = SnackbarMessage("Error al cargar cantones", SnackbarType.ERROR)) } }
		}
	}

	private fun loadDistricts() {
		screenModelScope.launch {
			districtsRepository.getDistricts()
				.onSuccess { districts -> _state.update { it.copy(availableDistricts = districts) } }
				.onFailure { _state.update { it.copy(snackBarMessage = SnackbarMessage("Error al cargar distritos", SnackbarType.ERROR)) } }
		}
	}

	private fun loadUsers() {
		screenModelScope.launch {
			userRepository.getUsers(excludeUser = true)
				.onSuccess { users -> _state.update { it.copy(availableUsers = users) } }
				.onFailure { _state.update { it.copy(snackBarMessage = SnackbarMessage("Error al cargar usuarios", SnackbarType.ERROR)) } }
		}
	}

	fun onEvent(event: FieldTripFormEvent) {
		when (event) {
			is FieldTripFormEvent.NameChanged -> {
				_state.update { it.copy(request = it.request.copy(field_trip_name = event.value), fieldErrors = it.fieldErrors - "name") }
			}
			is FieldTripFormEvent.ScheduledDateChanged -> {
				_state.update { it.copy(request = it.request.copy(field_trip_scheduled_date = event.value), fieldErrors = it.fieldErrors - "scheduled_date") }
			}
			is FieldTripFormEvent.StartDateChanged -> {
				_state.update { it.copy(request = it.request.copy(field_trip_start_date = event.value.ifBlank { null })) }
			}
			is FieldTripFormEvent.FinishDateChanged -> {
				_state.update { it.copy(request = it.request.copy(field_trip_finish_date = event.value.ifBlank { null })) }
			}
			is FieldTripFormEvent.ActiveStatusChanged -> {
				_state.update { it.copy(request = it.request.copy(field_trip_is_active = event.value)) }
			}
			is FieldTripFormEvent.ProvinceChanged -> {
				_state.update {
					it.copy(
						request = it.request.copy(
							province_snit_code = event.snitCode ?: 0,
							canton_snit_code = 0,
							district_snit_code = 0
						),
						fieldErrors = it.fieldErrors - "province"
					)
				}
			}
			is FieldTripFormEvent.CantonChanged -> {
				_state.update {
					it.copy(
						request = it.request.copy(
							canton_snit_code = event.snitCode ?: 0,
							district_snit_code = 0
						),
						fieldErrors = it.fieldErrors - "canton"
					)
				}
			}
			is FieldTripFormEvent.DistrictChanged -> {
				_state.update {
					it.copy(
						request = it.request.copy(district_snit_code = event.snitCode ?: 0),
						fieldErrors = it.fieldErrors - "district"
					)
				}
			}
			is FieldTripFormEvent.ParticipantAdded -> {
				if (!state.value.request.participants.contains(event.userId)) {
					_state.update {
						it.copy(request = it.request.copy(participants = it.request.participants + event.userId))
					}
				}
			}
			is FieldTripFormEvent.ParticipantRemoved -> {
				_state.update {
					it.copy(request = it.request.copy(participants = it.request.participants - event.userId))
				}
			}
			is FieldTripFormEvent.Submit -> submitForm()
			is FieldTripFormEvent.ShowSnackBar -> _state.update { it.copy(snackBarMessage = event.message) }
			is FieldTripFormEvent.ClearSnackBar -> _state.update { it.copy(snackBarMessage = null) }
		}
	}

	private fun submitForm() {
		if (!validateFields()) return
		_state.update { it.copy(isLoading = true, snackBarMessage = null) }

		screenModelScope.launch {
			val currentRequest = _state.value.request
			val result = if (fieldTripId != null) {
				fieldTripRepository.updateFieldTrip(fieldTripId, currentRequest)
			} else {
				fieldTripRepository.createFieldTrip(currentRequest)
			}

			if (result.isSuccess) {
				val successMsg = if (fieldTripId != null) "Gira actualizada correctamente." else "Gira creada correctamente."
				_state.update {
					it.copy(
						isSuccess = true,
						isLoading = false,
						snackBarMessage = SnackbarMessage(successMsg, SnackbarType.SUCCESS)
					)
				}
			} else {
				_state.update {
					it.copy(
						isLoading = false,
						snackBarMessage = SnackbarMessage("Error al procesar la gira.", SnackbarType.ERROR)
					)
				}
			}
		}
	}

	private fun validateFields(): Boolean {
		val errors = mutableMapOf<String, String>()
		val req = _state.value.request

		if (req.field_trip_name.isBlank()) {
			errors["name"] = "El nombre de la gira es obligatorio."
		}
		if (req.field_trip_scheduled_date.isBlank()) {
			errors["scheduled_date"] = "La fecha programada es obligatoria."
		}
		if (req.province_snit_code == 0) {
			errors["province"] = "Seleccione una provincia."
		}
		if (req.canton_snit_code == 0) {
			errors["canton"] = "Seleccione un cantón."
		}
		if (req.district_snit_code == 0) {
			errors["district"] = "Seleccione un distrito."
		}

		_state.update { it.copy(fieldErrors = errors) }
		return errors.isEmpty()
	}

	fun clearSuccess() {
		_state.update { it.copy(isSuccess = false) }
	}
}