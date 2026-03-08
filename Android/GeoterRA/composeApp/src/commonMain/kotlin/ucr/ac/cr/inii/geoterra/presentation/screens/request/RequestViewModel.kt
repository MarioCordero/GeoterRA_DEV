package ucr.ac.cr.inii.geoterra.presentation.screens.request

import cafe.adriel.voyager.core.model.screenModelScope
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import ucr.ac.cr.inii.geoterra.data.model.remote.AnalysisRequestRemote
import ucr.ac.cr.inii.geoterra.data.repository.AnalysisRequestRepository
import ucr.ac.cr.inii.geoterra.domain.repository.AnalysisRequestRepositoryInterface
import ucr.ac.cr.inii.geoterra.presentation.auth.AuthEvent
import ucr.ac.cr.inii.geoterra.presentation.auth.AuthEventBus
import ucr.ac.cr.inii.geoterra.presentation.base.BaseScreenModel

class RequestViewModel(
  private val requestRepository: AnalysisRequestRepositoryInterface,
  private val authEventBus: AuthEventBus
) : BaseScreenModel<RequestState>(RequestState()) {
  
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

    if (authEventBus.isLoggedIn.value == true) {
      fetchSubmittedRequests()
    }
  }

  private fun clearData() {
    _state.update { it.copy(requests = emptyList(), isLoading = false) }
  }
  
  fun fetchSubmittedRequests() {
    authEventBus.isLoggedIn.value?.let { if (!it) return }

    screenModelScope.launch {
      _state.update { it.copy(isLoading = true, snackBarMessage = null) }
      requestRepository.getMyRequests()
        .onSuccess { data ->
          _state.update { it.copy(isLoading = false, requests = data) }
        }
        .onFailure { exception ->
          _state.update { it.copy(isLoading = false, snackBarMessage = exception.message) }
        }
    }
  }

  fun setRequestToDelete(request: AnalysisRequestRemote?) {
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
   * Resets PDF states after closing the success dialog.
   */
  fun clearPdfError() {
    _state.update { it.copy(pdfError = null) }
  }

  fun dismissSnackBar() = updateState { it.copy(snackBarMessage = null) }
}