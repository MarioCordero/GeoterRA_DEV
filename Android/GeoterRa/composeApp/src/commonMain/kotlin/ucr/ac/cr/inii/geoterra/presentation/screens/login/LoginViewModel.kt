package ucr.ac.cr.inii.geoterra.presentation.screens.login

import cafe.adriel.voyager.core.model.screenModelScope
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import ucr.ac.cr.inii.geoterra.data.model.remote.LoginRequest
import ucr.ac.cr.inii.geoterra.domain.repository.AuthRepository
import ucr.ac.cr.inii.geoterra.presentation.auth.AuthViewModel
import ucr.ac.cr.inii.geoterra.presentation.base.BaseScreenModel

/**
 * Updated ViewModel to handle real API authentication.
 * @param authRepository Handles the HTTP calls to /auth/login
 * @param authViewModel Handles the global app session state
 */
class LoginViewModel(
    private val authRepository: AuthRepository,
    private val authViewModel: AuthViewModel
) : BaseScreenModel<LoginState>(LoginState()) {

    fun onEmailChanged(newValue: String) {
        updateState { it.copy(email = newValue, emailError = null) }
    }

    fun onPasswordChanged(newValue: String) {
        updateState { it.copy(password = newValue, passwordError = null) }
    }

    fun togglePasswordVisibility() {
        updateState { it.copy(isPasswordVisible = !it.isPasswordVisible) }
    }

    fun login() {
        val email = state.value.email
        val password = state.value.password

        // 1. Validaciones básicas
        if (email.isBlank() || !email.contains("@")) {
            updateState { it.copy(emailError = "Please enter a valid email") }
            return
        }
        if (password.length < 8) {
            updateState { it.copy(passwordError = "Password must be at least 8 characters") }
            return
        }

        // 2. Estado de carga
        updateState { it.copy(isLoading = true, passwordError = null, snackbarMessage = null) }

        // 3. Una sola corrutina
        screenModelScope.launch {
            authRepository.login(LoginRequest(email, password))
                .onSuccess {
                    authViewModel.loginSuccess()
                    updateState { it.copy(isLoading = false) }
                }
                .onFailure { error ->
                    updateState {
                        it.copy(
                            isLoading = false,
                            passwordError = error.message, // Texto bajo el campo
                            snackbarMessage = error.message // Mensaje flotante
                        )
                    }
                }
        }
    }

    fun dismissSnackbar() {
        updateState { it.copy(snackbarMessage = null) }
    }
}