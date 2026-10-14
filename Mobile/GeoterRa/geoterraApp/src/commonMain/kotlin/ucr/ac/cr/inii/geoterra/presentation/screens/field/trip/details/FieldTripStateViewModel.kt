package ucr.ac.cr.inii.geoterra.presentation.screens.field.trip.details

import cafe.adriel.voyager.core.model.screenModelScope
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import ucr.ac.cr.inii.geoterra.core.network.ApiException
import ucr.ac.cr.inii.geoterra.data.model.responses.FieldTripResponse
import ucr.ac.cr.inii.geoterra.domain.repository.FieldTripRepositoryInterface
import ucr.ac.cr.inii.geoterra.presentation.base.BaseScreenModel
import ucr.ac.cr.inii.geoterra.presentation.components.common.SnackbarMessage
import ucr.ac.cr.inii.geoterra.presentation.components.common.SnackbarType

class FieldTripDetailsViewModel(
	private val fieldTrip: FieldTripResponse,
	private val fieldTripRepository: FieldTripRepositoryInterface
) : BaseScreenModel<FieldTripDetailsState>(
	FieldTripDetailsState(fieldTrip = fieldTrip)
) {

	fun addGeomanifestation(geomanifestationId: String) {
		screenModelScope.launch {
			fieldTripRepository.addGeomanifestationToFieldTrip(
				id = state.value.fieldTrip.field_trip_id,
				geomanifestationId = geomanifestationId
			)
				.onSuccess { updatedFieldTrip ->
					_state.update {
						it.copy(
							fieldTrip = updatedFieldTrip,
							snackBarMessage = SnackbarMessage(
								text = "Manifestación agregada exitosamente a la gira",
								type = SnackbarType.SUCCESS
							)
						)
					}
				}
				.onFailure { exception ->
					val apiException = exception as? ApiException
					_state.update {
						it.copy(
							snackBarMessage = SnackbarMessage(
								text = apiException?.message ?: "Error al agregar manifestación",
								type = SnackbarType.ERROR
							)
						)
					}
				}
		}
	}

	fun removeGeomanifestation(geomanifestationId: String) {
		screenModelScope.launch {
			fieldTripRepository.removeGeomanifestationFromFieldTrip(
				id = state.value.fieldTrip.field_trip_id,
				geomanifestationId = geomanifestationId
			)
				.onSuccess { updatedFieldTrip ->
					_state.update {
						it.copy(
							fieldTrip = updatedFieldTrip,
							snackBarMessage = SnackbarMessage(
								text = "Manifestación removida de la gira",
								type = SnackbarType.SUCCESS
							)
						)
					}
				}
				.onFailure { exception ->
					val apiException = exception as? ApiException
					_state.update {
						it.copy(
							snackBarMessage = SnackbarMessage(
								text = apiException?.message ?: "Error al remover manifestación",
								type = SnackbarType.ERROR
							)
						)
					}
				}
		}
	}

	fun updateSnackBarMessage(message: String, type: SnackbarType = SnackbarType.INFO) {
		_state.update { it.copy(snackBarMessage = SnackbarMessage(message, type)) }
	}
	
	fun clearSnackBarMessage() {
		_state.update { it.copy(snackBarMessage = null) }
	}
}