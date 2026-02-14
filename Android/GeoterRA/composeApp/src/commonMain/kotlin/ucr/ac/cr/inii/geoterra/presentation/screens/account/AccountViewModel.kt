package ucr.ac.cr.inii.geoterra.presentation.screens.account

import cafe.adriel.voyager.core.model.ScreenModel
import cafe.adriel.voyager.core.model.screenModelScope
import com.kdroid.kmplog.Log
import com.kdroid.kmplog.i
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import ucr.ac.cr.inii.geoterra.domain.repository.UserRepository
import ucr.ac.cr.inii.geoterra.presentation.auth.AuthViewModel

class AccountViewModel(
    private val userRepository: UserRepository,
    private val authViewModel: AuthViewModel
) : ScreenModel {
    private val _state = MutableStateFlow(AccountState())
    val state = _state.asStateFlow()

    init { loadUserProfile() }

    fun loadUserProfile() {
        screenModelScope.launch {
            _state.update { it.copy(isLoading = true, error = null) }
            userRepository.getMe()
                .onSuccess { user -> _state.update { it.copy(user = user, isLoading = false) } }
                .onFailure { e -> _state.update { it.copy(error = e.message, isLoading = false) } }
        }
    }

    fun refresh() {
        screenModelScope.launch {
            _state.update { it.copy(isLoading = true, error = null) }
            authViewModel.refreshAccessToken()
            _state.update { it.copy(isLoading = false) }
            Log.i("AccountViewModel", "Refreshed access token")
            loadUserProfile()
        }
    }


    fun logout() {
        screenModelScope.launch {
            authViewModel.logout()
        }
    }
}