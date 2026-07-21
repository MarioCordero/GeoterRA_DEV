package ucr.ac.cr.inii.geoterra.presentation.screens.sign.`in`

import cafe.adriel.voyager.core.model.screenModelScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import ucr.ac.cr.inii.geoterra.data.model.requests.LoginRequest
import ucr.ac.cr.inii.geoterra.domain.auth.AuthService
import ucr.ac.cr.inii.geoterra.presentation.base.BaseScreenModel
import ucr.ac.cr.inii.geoterra.presentation.components.common.SnackbarMessage
import ucr.ac.cr.inii.geoterra.presentation.components.common.SnackbarType

/**
 * Updated ViewModel to handle real API authentication.
 * 
 */
class SignInViewModel(
  private val authService: AuthService,
) : BaseScreenModel<SignInState>(SignInState()) {
  
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
        fieldErrors = emptyMap()
			)
    }

    if (!validateFields()) return

    updateState { it.copy(isLoading = true) }

    screenModelScope.launch {
      val s = state.value
      val request = LoginRequest(s.email, s.password)

      authService.login(request)
        .onSuccess {
          delay(100)
          updateState { it.copy(isLoading = false, isSuccess = true) }
        }
        .onFailure { error ->
          updateState {
            it.copy(
              isLoading = false,
							snackBarMessage = SnackbarMessage(
								text = error.message ?: "Ocurrió un error inesperado al iniciar sesión.",
								type = SnackbarType.ERROR
							)
						)
          }
        }
    }
  }
  
  fun onSnackBarDismissed() {
    updateState { it.copy(snackBarMessage = null) }
  }
}