package ucr.ac.cr.inii.geoterra.presentation.screens.register

import cafe.adriel.voyager.core.model.screenModelScope
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.launch
import ucr.ac.cr.inii.geoterra.data.model.remote.RegisterRequest
import ucr.ac.cr.inii.geoterra.domain.auth.AuthEvent
import ucr.ac.cr.inii.geoterra.domain.auth.AuthEventBus
import ucr.ac.cr.inii.geoterra.presentation.base.BaseScreenModel

class RegisterViewModel(
  private val authEventBus: AuthEventBus
) : BaseScreenModel<RegisterState>(RegisterState()) {

  fun onNameChanged(v: String) = updateState { it.copy(name = v, fieldErrors = it.fieldErrors - "name") }
  fun onLastnameChanged(v: String) = updateState { it.copy(lastname = v, fieldErrors = it.fieldErrors - "lastname") }
  fun onEmailChanged(v: String) = updateState { it.copy(email = v, fieldErrors = it.fieldErrors - "email") }
  fun onPhoneChanged(v: String) = updateState { it.copy(phoneNumber = v, fieldErrors = it.fieldErrors - "phone") }
  fun onPasswordChanged(v: String) = updateState { it.copy(password = v, fieldErrors = it.fieldErrors - "password") }
  fun onConfirmPasswordChanged(v: String) = updateState { it.copy(confirmPassword = v) }
  fun togglePasswordVisibility() = updateState { it.copy(isPasswordVisible = !it.isPasswordVisible) }
  fun dismissSnackbar() = updateState { it.copy(snackBarMessage = null) }

  fun clearStatus() = updateState { it.copy(isSuccess = false, error = null) }

  fun register() {

    updateState {
      it.copy(
        name = it.name.trim(),
        lastname = it.lastname.trim(),
        email = it.email.trim(),
        phoneNumber = it.phoneNumber.trim(),
        password = it.password.trim(),
        confirmPassword = it.confirmPassword.trim(),
        fieldErrors = emptyMap(),
        error = null
      )
    }

    if (!validateFields()) return

    updateState { it.copy(isLoading = true, snackBarMessage = null) }

    screenModelScope.launch {
      val s = state.value
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
              error = error.message
                ?: "Ha ocurrido un error de servidor al crear la cuenta."
            )
          }
        }
    }
  }

  private fun validateFields(): Boolean {
    val errors = mutableMapOf<String, String>()
    val s = state.value

    if (s.name.isBlank()) errors["name"] = "Por favor, proporcione un nombre."
    if (s.lastname.isBlank()) errors["lastname"] = "Por favor, proporcione un apellido."

    val emailRegex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[a-z]+$".toRegex()
    if (s.email.isBlank()) errors["email"] = "Por favor, proporcione un correo electrónico."
    else if (!s.email.matches(emailRegex)) errors["email"] = "El formato del correo electrónico no es válido."

    if (s.phoneNumber.isNotBlank()) {
      val phoneRegex = "^[0-9]{8}$|^[0-9]{4}[- ]?[0-9]{4}$".toRegex()
      if (!s.phoneNumber.trim().matches(phoneRegex)) errors["phone"] = "Debe ser un número de teléfono válido."
    }

    if (s.password.length < 8) {
      errors["password"] = "La contraseña debe tener al menos 8 caracteres."
    } else if (s.password != s.confirmPassword) {
      errors["password"] = "Las contraseñas no coinciden."
    }

    updateState { it.copy(fieldErrors = errors) }
    return errors.isEmpty()
  }
}