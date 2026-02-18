package ucr.ac.cr.inii.geoterra.presentation.screens.request

import cafe.adriel.voyager.core.model.ScreenModel
import cafe.adriel.voyager.core.model.screenModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import ucr.ac.cr.inii.geoterra.domain.repository.AnalysisRequestRepository

class RequestViewModel(
    private val requestRepository: AnalysisRequestRepository
) : ScreenModel {
    private val _state = MutableStateFlow(RequestState())
    val state = _state.asStateFlow()

    init {
        fetchSubmittedRequests()
    }

    fun fetchSubmittedRequests() {
        screenModelScope.launch {
            _state.update { it.copy(isLoading = true, errorMessage = null) }
            requestRepository.getMyRequests()
                .onSuccess { data ->
                    _state.update { it.copy(isLoading = false, requests = data) }
                }
                .onFailure { exception ->
                    _state.update { it.copy(isLoading = false, errorMessage = exception.message) }
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
                    _state.update { it.copy(isLoading = false, errorMessage = exception.message) }
                }
        }
    }
}