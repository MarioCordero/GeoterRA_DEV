package ucr.ac.cr.inii.geoterra.presentation.screens.register

import cafe.adriel.voyager.core.model.screenModelScope
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.launch
import ucr.ac.cr.inii.geoterra.data.model.remote.RegisterRequest
import ucr.ac.cr.inii.geoterra.presentation.auth.AuthEvent
import ucr.ac.cr.inii.geoterra.presentation.auth.AuthEventBus
import ucr.ac.cr.inii.geoterra.presentation.base.BaseScreenModel

class RegisterViewModel(
  private val authEventBus: AuthEventBus
) : BaseScreenModel<RegisterState>(RegisterState()) {

  fun onNameChanged(v: String) = updateState { it.copy(name = v, nameError = null) }
  fun onLastnameChanged(v: String) = updateState { it.copy(lastname = v, lastnameError = null) }
  fun onEmailChanged(v: String) = updateState { it.copy(email = v, emailError = null) }
  fun onPhoneChanged(v: String) = updateState { it.copy(phoneNumber = v) }
  fun onPasswordChanged(v: String) = updateState { it.copy(password = v, passwordError = null) }
  fun onConfirmPasswordChanged(v: String) = updateState { it.copy(confirmPassword = v) }
  fun togglePasswordVisibility() = updateState { it.copy(isPasswordVisible = !it.isPasswordVisible) }
  fun dismissSnackbar() = updateState { it.copy(snackBarMessage = null) }

  fun clearStatus() = updateState { it.copy(isSuccess = false, errorMessage = null) }

  fun register() {
    val s = state.value

    if (s.name.isBlank()) return updateState { it.copy(nameError = "Requerido") }
    if (s.email.isBlank() || !s.email.contains("@")) return updateState { it.copy(emailError = "Email inválido") }
    if (s.password.length < 8) return updateState { it.copy(passwordError = "Mínimo 8 caracteres") }
    if (s.password != s.confirmPassword) return updateState { it.copy(passwordError = "Las contraseñas no coinciden") }

    updateState { it.copy(isLoading = true, snackBarMessage = null) }

    screenModelScope.launch {
      val request = RegisterRequest(
        name = s.name,
        lastname = s.lastname,
        email = s.email,
        phone_number = s.phoneNumber.ifBlank { null },
        password = s.password
      )

      val deferred = CompletableDeferred<Result<Unit>>()

      authEventBus.emit(AuthEvent.Register(request, deferred))

      deferred.await()
        .onSuccess {
          updateState { it.copy(isLoading = false, isSuccess = true) }
        }
        .onFailure { error ->
          updateState {
            it.copy(
              isLoading = false,
              errorMessage = error.message
                ?: "Ha ocurrido un error de servidor al actualizar al crear la cuenta."
            )
          }
        }
    }
  }
}