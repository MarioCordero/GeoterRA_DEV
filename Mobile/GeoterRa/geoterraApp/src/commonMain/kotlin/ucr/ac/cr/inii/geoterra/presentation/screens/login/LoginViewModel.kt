package ucr.ac.cr.inii.geoterra.presentation.screens.login

import cafe.adriel.voyager.core.model.screenModelScope
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import ucr.ac.cr.inii.geoterra.data.model.remote.LoginRequest
import ucr.ac.cr.inii.geoterra.domain.auth.AuthEvent
import ucr.ac.cr.inii.geoterra.domain.auth.AuthEventBus
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
    updateState { it.copy(email = newValue, fieldErrors = it.fieldErrors - "email") }
  }
  
  fun onPasswordChanged(newValue: String) {
    updateState { it.copy(password = newValue, fieldErrors = it.fieldErrors - "password") }
  }
  
  fun togglePasswordVisibility() {
    updateState { it.copy(isPasswordVisible = !it.isPasswordVisible) }
  }

  private fun validateFields(): Boolean {
    val errors = mutableMapOf<String, String>()
    val s = state.value

    val emailRegex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[a-z]+$".toRegex()

    if (s.email.isBlank()) {
      errors["email"] = "Por favor, proporcione un correo electrónico."
    } else if (!s.email.matches(emailRegex)) {
      errors["email"] = "Invalid email format."
    }

    if (s.password.length < 8) {
      errors["password"] = "La contraseña debe tener al menos 8 carácteres."
    }

    updateState { it.copy(fieldErrors = errors) }
    return errors.isEmpty()
  }
  
  fun login() {
    updateState {
      it.copy(
        email = it.email.trim(),
        password = it.password.trim(),
        fieldErrors = emptyMap(),
        error = null
      )
    }

    if (!validateFields()) return

    updateState { it.copy(isLoading = true) }

    screenModelScope.launch {
      val s = state.value
      val deferred = CompletableDeferred<Result<Unit>>()

      authEventBus.emit(
        AuthEvent.Login(
          LoginRequest(s.email, s.password)
          , deferred
        )
      )

      deferred.await()
        .onSuccess {
          delay(100)
          updateState { it.copy(isLoading = false, isSuccess = true) }
        }
        .onFailure { error ->
          updateState {
            it.copy(
              isLoading = false,
              error = error.message
            )
          }
        }
    }
  }
  
  fun dismissSnackbar() {
    updateState { it.copy(snackBarMessage = null) }
  }

  fun clearStatus() {
    updateState { it.copy(isSuccess = false, error = null) }
  }
}