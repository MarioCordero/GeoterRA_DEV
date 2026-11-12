package ucr.ac.cr.inii.geoterra.presentation.screens.field.trip.details

import cafe.adriel.voyager.core.model.screenModelScope
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import ucr.ac.cr.inii.geoterra.core.network.ApiException
import ucr.ac.cr.inii.geoterra.domain.repository.FieldTripRepositoryInterface
import ucr.ac.cr.inii.geoterra.domain.repository.GeomanifestationsRepositoryInterface
import ucr.ac.cr.inii.geoterra.presentation.base.BaseScreenModel
import ucr.ac.cr.inii.geoterra.presentation.components.common.SnackbarMessage
import ucr.ac.cr.inii.geoterra.presentation.components.common.SnackbarType

class FieldTripDetailsViewModel(
	private val fieldTripId: String,
	private val fieldTripRepository: FieldTripRepositoryInterface,
	private val geomanifestationsRepository: GeomanifestationsRepositoryInterface
) : BaseScreenModel<FieldTripDetailsState>(FieldTripDetailsState()) {

	init {
		fetchFieldTripDetails()
	}

	fun fetchFieldTripDetails() {
		screenModelScope.launch {
			_state.update { it.copy(isLoading = true, snackBarMessage = null) }
			fieldTripRepository.getFieldTripById(fieldTripId)
				.onSuccess { data ->
					_state.update { it.copy(isLoading = false, fieldTrip = data) }
				}
				.onFailure { exception ->
					val apiException = exception as? ApiException
					_state.update {
						it.copy(
							isLoading = false,
							snackBarMessage = SnackbarMessage(
								text = apiException?.message ?: "Error al obtener los detalles de la gira",
								type = SnackbarType.ERROR
							)
						)
					}
				}
		}
	}
	fun deleteGeomanifestation(geomanifestationId: String) {
		screenModelScope.launch {
			_state.update { it.copy(isLoading = true, snackBarMessage = null) }

			geomanifestationsRepository.deleteGeomanifestation(id = geomanifestationId)
				.onSuccess {
					fetchFieldTripDetails()

					_state.update { state ->
						state.copy(
							snackBarMessage = SnackbarMessage(
								text = "Geomanifestación eliminada con éxito",
								type = SnackbarType.SUCCESS
							)
						)
					}
				}
				.onFailure { exception ->
					val apiException = exception as? ApiException
					_state.update { state ->
						state.copy(
							isLoading = false,
							snackBarMessage = SnackbarMessage(
								text = apiException?.message ?: "Error al eliminar Geomanifestación",
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

	fun setPdfGenerating(isGenerating: Boolean) {
		_state.update { it.copy(isPdfGenerating = isGenerating) }
	}

	fun setGeneratedPdfPath(path: String?) {
		_state.update { it.copy(lastGeneratedPdfPath = path) }
	}

	fun clearPdfStatus() {
		_state.update { it.copy(lastGeneratedPdfPath = null, isPdfGenerating = false) }
	}
}