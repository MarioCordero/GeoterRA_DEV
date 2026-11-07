package ucr.ac.cr.inii.geoterra.presentation.screens.investigation.requests.details

import cafe.adriel.voyager.core.model.screenModelScope
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import ucr.ac.cr.inii.geoterra.core.network.ApiException
import ucr.ac.cr.inii.geoterra.data.model.responses.InvestigationRequestResponse
import ucr.ac.cr.inii.geoterra.domain.repository.InvestigationRequestsRepositoryInterface
import ucr.ac.cr.inii.geoterra.presentation.base.BaseScreenModel
import ucr.ac.cr.inii.geoterra.presentation.components.common.SnackbarMessage
import ucr.ac.cr.inii.geoterra.presentation.components.common.SnackbarType

class InvestigationRequestDetailsViewModel(
	request: InvestigationRequestResponse,
	private val repository: InvestigationRequestsRepositoryInterface
) : BaseScreenModel<InvestigationRequestDetailsState>(
	InvestigationRequestDetailsState(request = request)
) {

	fun fetchRequestStatuses(id: String) {
		screenModelScope.launch {
			_state.update { it.copy(isLoading = true, snackBarMessage = null) }

			repository.getRequestStatuses(id)
				.onSuccess { statusList ->
					_state.update { it.copy(isLoading = false, statuses = statusList) }
				}
				.onFailure { exception ->
					val apiException = exception as? ApiException
					_state.update {
						it.copy(
							isLoading = false,
							snackBarMessage = SnackbarMessage(
								text = apiException?.message ?: "Error al obtener historial de estados",
								type = SnackbarType.ERROR
							)
						)
					}
				}
		}
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

	fun updateSnackBarMessage(message: String, type: SnackbarType = SnackbarType.INFO) {
		_state.update { it.copy(snackBarMessage = SnackbarMessage(message, type)) }
	}

	fun clearSnackBarMessage() {
		_state.update { it.copy(snackBarMessage = null) }
	}
}