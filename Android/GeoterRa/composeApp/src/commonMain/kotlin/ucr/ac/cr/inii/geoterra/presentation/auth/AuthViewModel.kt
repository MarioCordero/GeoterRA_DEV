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
    private val _isLoggedIn = MutableStateFlow(authRepository.isUserLoggedIn())
    val isLoggedIn = _isLoggedIn.asStateFlow()

    init {
        // Escuchamos globalmente si el cliente de red detecta sesión expirada
        screenModelScope.launch {
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