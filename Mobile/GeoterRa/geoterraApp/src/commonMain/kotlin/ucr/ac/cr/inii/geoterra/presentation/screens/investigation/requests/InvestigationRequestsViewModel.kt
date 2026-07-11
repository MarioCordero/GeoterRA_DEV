package ucr.ac.cr.inii.geoterra.presentation.screens.investigation.requests

import cafe.adriel.voyager.core.model.screenModelScope
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import ucr.ac.cr.inii.geoterra.data.model.responses.InvestigationRequestResponse
import ucr.ac.cr.inii.geoterra.domain.repository.InvestigationRequestsRepositoryInterface
import ucr.ac.cr.inii.geoterra.domain.auth.AuthEvent
import ucr.ac.cr.inii.geoterra.domain.auth.AuthEventBus
import ucr.ac.cr.inii.geoterra.presentation.base.BaseScreenModel

class InvestigationRequestsViewModel(
  private val requestRepository: InvestigationRequestsRepositoryInterface,
  private val authEventBus: AuthEventBus
) : BaseScreenModel<InvestigationRequestsState>(InvestigationRequestsState()) {
  
  init {
    screenModelScope.launch {
      authEventBus.events.collect { event ->
        when (event) {
          is AuthEvent.Unauthorized -> {
            clearData()
          }

          is AuthEvent.Authorized -> {
            fetchSubmittedRequests()
          }

          else -> {}
        }
      }
    }
  }

  private fun clearData() {
    _state.update { it.copy(requests = emptyList(), isLoading = false) }
  }
  
  fun fetchSubmittedRequests() {
    screenModelScope.launch {
      _state.update { it.copy(isLoading = true, snackBarMessage = null) }
      requestRepository.getMyRequests()
        .onSuccess { data ->
          _state.update { it.copy(isLoading = false, requests = data) }
        }
        .onFailure { exception ->
          if (exception.message == "Tu sesión ha expirado. Por favor, inicia sesión de nuevo.") {
            _state.update { it.copy(isLoading = false) }
          } else {
            _state.update { it.copy(isLoading = false, snackBarMessage = exception.message) }
          }
        }
    }
  }

  fun setRequestToDelete(request: InvestigationRequestResponse?) {
    _state.update { it.copy(requestToDelete = request) }
  }

  fun deleteRequest(requestId: String) {
    screenModelScope.launch {
      _state.update { it.copy(isLoading = true, requestToDelete = null) }
      requestRepository.deleteRequest(requestId)
        .onSuccess {
          _state.update { it.copy(isLoading = false, showSuccessDialog = true) }
          fetchSubmittedRequests()
        }
        .onFailure { exception ->
          _state.update { it.copy(isLoading = false, snackBarMessage = exception.message) }
        }
    }
  }

  fun clearSuccessDialog() {
    _state.update { it.copy(showSuccessDialog = false) }
  }

  /**
   * Updates the state to reflect PDF generation progress.
   */
  fun setPdfGenerating(isGenerating: Boolean) {
    _state.update { it.copy(isPdfGenerating = isGenerating) }
  }

  /**
   * Stores the path of the generated PDF.
   */
  fun setGeneratedPdfPath(path: String?) {
    _state.update { it.copy(lastGeneratedPdfPath = path) }
  }

  /**
   * Resets PDF states after closing the success dialog.
   */
  fun clearPdfStatus() {
    _state.update { it.copy(lastGeneratedPdfPath = null, isPdfGenerating = false) }
  }

  /**
   * Stores the path of the generated PDF.
   */
  fun setPdfError(error: String?) {
    _state.update { it.copy(pdfError = error) }
  }

  /**
   * Resets PDF states after closing the status dialog.
   */
  fun clearPdfError() {
    _state.update { it.copy(pdfError = null) }
  }

  fun dismissSnackBar() = updateState { it.copy(snackBarMessage = null) }
}