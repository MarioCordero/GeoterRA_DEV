package ucr.ac.cr.inii.geoterra.presentation.screens.login

import cafe.adriel.voyager.core.model.screenModelScope
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.launch
import ucr.ac.cr.inii.geoterra.data.model.remote.LoginRequest
import ucr.ac.cr.inii.geoterra.presentation.auth.AuthEvent
import ucr.ac.cr.inii.geoterra.presentation.auth.AuthEventBus
import ucr.ac.cr.inii.geoterra.presentation.base.BaseScreenModel

/**
 * Updated ViewModel to handle real API authentication.
 * @param authRepository Handles the HTTP calls to /auth/login
 * @param authViewModel Handles the global app session state
 */
class LoginViewModel(
  private val authEventBus: AuthEventBus,
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
      updateState { it.copy(emailError = "Por favor, ingrese un email válido") }
      return
    }
    if (password.length < 8) {
      updateState { it.copy(passwordError = "La contraseña debe tener al menos 8 carácteres") }
      return
    }
    
    // 2. Estado de carga
    updateState { it.copy(isLoading = true, passwordError = null, snackBarMessage = null) }
    
    // 3. Una sola corrutina
    screenModelScope.launch {
      val deferred = CompletableDeferred<Result<Unit>>()

      authEventBus.emit(AuthEvent.Login(LoginRequest(email, password), deferred))

      deferred.await()
        .onSuccess {
          updateState { it.copy(isLoading = false) }
        }
        .onFailure { error ->
          updateState {
            it.copy(
              isLoading = false,
              passwordError = error.message, // Texto bajo el campo
              snackBarMessage = error.message // Mensaje flotante
            )
          }
        }
    }
  }
  
  fun dismissSnackbar() {
    updateState { it.copy(snackBarMessage = null) }
  }
}