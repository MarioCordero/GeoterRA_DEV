package ucr.ac.cr.inii.geoterra.presentation.screens.request

import cafe.adriel.voyager.core.model.screenModelScope
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import ucr.ac.cr.inii.geoterra.domain.repository.AnalysisRequestRepository
import ucr.ac.cr.inii.geoterra.presentation.base.BaseScreenModel

class RequestViewModel(
  private val requestRepository: AnalysisRequestRepository
) : BaseScreenModel<RequestState>(RequestState()) {
  
  init {
    fetchSubmittedRequests()
  }
  
  fun fetchSubmittedRequests() {
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
  
  fun deleteRequest(requestId: String) {
    screenModelScope.launch {
      _state.update { it.copy(isLoading = true) }
      requestRepository.deleteRequest(requestId)
        .onSuccess {
          fetchSubmittedRequests()
        }
        .onFailure { exception ->
          _state.update { it.copy(isLoading = false, snackBarMessage = exception.message) }
        }
    }
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