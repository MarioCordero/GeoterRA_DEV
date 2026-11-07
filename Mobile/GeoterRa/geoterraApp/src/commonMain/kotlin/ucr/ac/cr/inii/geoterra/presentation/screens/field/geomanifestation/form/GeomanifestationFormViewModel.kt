package ucr.ac.cr.inii.geoterra.presentation.screens.geomanifestation.form

import cafe.adriel.voyager.core.model.screenModelScope
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import ucr.ac.cr.inii.geoterra.data.model.requests.GeomanifestationRequest
import ucr.ac.cr.inii.geoterra.data.model.responses.GeomanifestationResponse
import ucr.ac.cr.inii.geoterra.domain.repository.CantonRepositoryInterface
import ucr.ac.cr.inii.geoterra.domain.repository.DistrictRepositoryInterface
import ucr.ac.cr.inii.geoterra.domain.repository.GeomanifestationsRepositoryInterface
import ucr.ac.cr.inii.geoterra.domain.repository.ProvinceRepositoryInterface
import ucr.ac.cr.inii.geoterra.presentation.base.BaseScreenModel
import ucr.ac.cr.inii.geoterra.presentation.components.common.SnackbarMessage
import ucr.ac.cr.inii.geoterra.presentation.components.common.SnackbarType

class GeomanifestationFormViewModel(
	private val fieldTripId: String,
	private val geomanifestationsRepository: GeomanifestationsRepositoryInterface,
	private val provincesRepository: ProvinceRepositoryInterface,
	private val cantonsRepository: CantonRepositoryInterface,
	private val districtsRepository: DistrictRepositoryInterface,
	private val geomanifestationToEdit: GeomanifestationResponse? = null
) : BaseScreenModel<GeomanifestationFormState>(GeomanifestationFormState()) {

	init {
		loadProvinces()
		loadCantons()
		loadDistricts()

		_state.update { state ->
			val baseReq = geomanifestationToEdit?.let {
				GeomanifestationRequest(
					geomanifestation_name = it.geomanifestation_name,
					description = it.description ?: "",
					province_snit_code = it.location.province_snit_code,
					canton_snit_code = it.location.canton_snit_code,
					district_snit_code = it.location.district_snit_code,
					latitude = it.location.latitude ?: 0.0,
					longitude = it.location.longitude ?: 0.0,
					field_trip_id = fieldTripId
				)
			} ?: state.request.copy(field_trip_id = fieldTripId)
			state.copy(request = baseReq)
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

	fun onEvent(event: GeomanifestationFormEvent) {
		when (event) {
			is GeomanifestationFormEvent.NameChanged -> {
				_state.update { it.copy(request = it.request.copy(geomanifestation_name = event.value), fieldErrors = it.fieldErrors - "name") }
			}
			is GeomanifestationFormEvent.DescriptionChanged -> {
				_state.update { it.copy(request = it.request.copy(description = event.value), fieldErrors = it.fieldErrors - "description") }
			}
			is GeomanifestationFormEvent.ProvinceChanged -> {
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
			is GeomanifestationFormEvent.CantonChanged -> {
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
			is GeomanifestationFormEvent.DistrictChanged -> {
				_state.update {
					it.copy(
						request = it.request.copy(district_snit_code = event.snitCode ?: 0),
						fieldErrors = it.fieldErrors - "district"
					)
				}
			}
			is GeomanifestationFormEvent.LatitudeChanged -> {
				val lat = event.value.toDoubleOrNull() ?: 0.0
				_state.update { it.copy(request = it.request.copy(latitude = lat), fieldErrors = it.fieldErrors - "latitude") }
			}
			is GeomanifestationFormEvent.LongitudeChanged -> {
				val lon = event.value.toDoubleOrNull() ?: 0.0
				_state.update { it.copy(request = it.request.copy(longitude = lon), fieldErrors = it.fieldErrors - "longitude") }
			}
			is GeomanifestationFormEvent.VisibilityChanged -> {
				_state.update { it.copy(request = it.request.copy(visibility = event.value)) }
			}
			is GeomanifestationFormEvent.Submit -> submitForm()
			is GeomanifestationFormEvent.ClearSnackBar -> _state.update { it.copy(snackBarMessage = null) }
		}
	}

	private fun submitForm() {
		if (!validateFields()) return
		_state.update { it.copy(isLoading = true, snackBarMessage = null) }

		screenModelScope.launch {
			val currentRequest = _state.value.request
			val result = if (geomanifestationToEdit != null) {
				geomanifestationsRepository.updateGeomanifestation(geomanifestationToEdit.geomanifestation_id, currentRequest)
			} else {
				geomanifestationsRepository.registerGeomanifestation(currentRequest)
			}

			if (result.isSuccess) {
				_state.update {
					it.copy(
						isSuccess = true,
						isLoading = false,
						snackBarMessage = SnackbarMessage("Manifestación guardada correctamente.", SnackbarType.SUCCESS)
					)
				}
			} else {
				_state.update {
					it.copy(
						isLoading = false,
						snackBarMessage = SnackbarMessage("Error al guardar la manifestación geotermal.", SnackbarType.ERROR)
					)
				}
			}
		}
	}

	private fun validateFields(): Boolean {
		val errors = mutableMapOf<String, String>()
		val req = _state.value.request

		if (req.geomanifestation_name.isBlank()) errors["name"] = "El nombre es obligatorio."
		if (req.description.isBlank()) errors["description"] = "La descripción es obligatoria."
		if (req.province_snit_code == 0) errors["province"] = "Seleccione una provincia."
		if (req.canton_snit_code == 0) errors["canton"] = "Seleccione un cantón."
		if (req.district_snit_code == 0) errors["district"] = "Seleccione un distrito."

		_state.update { it.copy(fieldErrors = errors) }
		return errors.isEmpty()
	}

	fun clearSuccess() {
		_state.update { it.copy(isSuccess = false) }
	}
}