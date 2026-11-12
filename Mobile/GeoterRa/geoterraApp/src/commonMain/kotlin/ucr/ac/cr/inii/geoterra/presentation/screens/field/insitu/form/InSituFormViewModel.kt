package ucr.ac.cr.inii.geoterra.presentation.screens.field.insitu.form

import cafe.adriel.voyager.core.model.screenModelScope
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import ucr.ac.cr.inii.geoterra.data.model.requests.InSituTestRequest
import ucr.ac.cr.inii.geoterra.data.model.responses.InSituTestResponse
import ucr.ac.cr.inii.geoterra.domain.repository.InSituTestRepositoryInterface
import ucr.ac.cr.inii.geoterra.presentation.base.BaseScreenModel
import ucr.ac.cr.inii.geoterra.presentation.components.common.SnackbarMessage
import ucr.ac.cr.inii.geoterra.presentation.components.common.SnackbarType

class InSituFormViewModel(
	private val geomanifestationId: String,
	private val geomanifestationName: String,
	private val inSituTestRepository: InSituTestRepositoryInterface,
	private val testToEdit: InSituTestResponse? = null
) : BaseScreenModel<InSituFormState>(InSituFormState()) {

	init {
		_state.update { state ->
			val baseReq = testToEdit?.let {
				InSituTestRequest.fromRemote(it)
			} ?: state.request.copy(geomanifestation_id = geomanifestationId)

			state.copy(
				request = baseReq,
				geomanifestationName = geomanifestationName ?: "",
				temperatureInput = testToEdit?.temperature?.toString() ?: "",
				phInput = testToEdit?.ph?.toString() ?: "",
				conductivityInput = testToEdit?.conductivity?.toString() ?: ""
			)
		}
	}

	fun onEvent(event: InSituFormEvent) {
		when (event) {
			is InSituFormEvent.NameChanged -> {
				_state.update {
					it.copy(
						request = it.request.copy(insitu_test_name = event.value),
						fieldErrors = it.fieldErrors - "name"
					)
				}
			}
			is InSituFormEvent.TemperatureChanged -> {
				val tempVal = event.value.toDoubleOrNull()
				_state.update {
					it.copy(
						temperatureInput = event.value,
						request = it.request.copy(temperature = tempVal),
						fieldErrors = it.fieldErrors - "temperature"
					)
				}
			}
			is InSituFormEvent.PhChanged -> {
				val phVal = event.value.toDoubleOrNull()
				_state.update {
					it.copy(
						phInput = event.value,
						request = it.request.copy(ph = phVal),
						fieldErrors = it.fieldErrors - "ph"
					)
				}
			}
			is InSituFormEvent.ConductivityChanged -> {
				val condVal = event.value.toDoubleOrNull()
				_state.update {
					it.copy(
						conductivityInput = event.value,
						request = it.request.copy(conductivity = condVal),
						fieldErrors = it.fieldErrors - "conductivity"
					)
				}
			}
			is InSituFormEvent.DescriptionChanged -> {
				_state.update {
					it.copy(
						request = it.request.copy(description = event.value),
						fieldErrors = it.fieldErrors - "description"
					)
				}
			}
			is InSituFormEvent.Submit -> submitForm()
			is InSituFormEvent.ClearSnackBar -> _state.update { it.copy(snackBarMessage = null) }
		}
	}

	private fun submitForm() {
		if (!validateFields()) return
		_state.update { it.copy(isLoading = true, snackBarMessage = null) }

		screenModelScope.launch {
			val currentRequest = _state.value.request
			val result = if (testToEdit != null) {
				inSituTestRepository.updateInsituTest(testToEdit.insitu_test_id, currentRequest)
			} else {
				inSituTestRepository.createInsituTest(currentRequest)
			}

			if (result.isSuccess) {
				_state.update {
					it.copy(
						isSuccess = true,
						isLoading = false,
						snackBarMessage = SnackbarMessage("Prueba de Campo guardada correctamente.", SnackbarType.SUCCESS)
					)
				}
			} else {
				_state.update {
					it.copy(
						isLoading = false,
						snackBarMessage = SnackbarMessage("Error al guardar la Prueba de Campo", SnackbarType.ERROR)
					)
				}
			}
		}
	}

	private fun validateFields(): Boolean {
		val errors = mutableMapOf<String, String>()
		val req = _state.value.request

		if (req.insitu_test_name.isNullOrBlank()) {
			errors["name"] = "El nombre de la prueba es obligatorio."
		}

		_state.update { it.copy(fieldErrors = errors) }
		return errors.isEmpty()
	}

	fun clearSuccess() {
		_state.update { it.copy(isSuccess = false) }
	}
}