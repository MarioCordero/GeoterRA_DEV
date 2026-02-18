package ucr.ac.cr.inii.geoterra.presentation.auth

import cafe.adriel.voyager.core.model.ScreenModel
import cafe.adriel.voyager.core.model.screenModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import ucr.ac.cr.inii.geoterra.domain.repository.AuthRepository

class AuthViewModel(
    private val authRepository: AuthRepository,
    private val authEventBus: AuthEventBus
) : ScreenModel {
    private val _isLoggedIn = MutableStateFlow<Boolean?>(null)
    val isLoggedIn = _isLoggedIn.asStateFlow()

    init {
        // Coroutine scope for the ViewModel
        screenModelScope.launch {
            // Check if the user is logged in when the ViewModel is created
            _isLoggedIn.value = authRepository.isUserLoggedIn()
            // Subscribe to unauthorized events
            authEventBus.unauthorizedEvents.collect {
                _isLoggedIn.value = false
            }
        }
    }

    fun loginSuccess() {
        _isLoggedIn.value = true
    }

    suspend fun logout() {
        authRepository.logout()
        _isLoggedIn.value = false
    }

    suspend fun refreshAccessToken() {
        authRepository.refreshAccessToken()
    }

}