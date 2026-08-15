package ucr.ac.cr.inii.geoterra.presentation.screens.account.password.recovery

import cafe.adriel.voyager.core.model.screenModelScope
import kotlinx.coroutines.launch
import ucr.ac.cr.inii.geoterra.domain.auth.AuthService
import ucr.ac.cr.inii.geoterra.presentation.base.BaseScreenModel
import ucr.ac.cr.inii.geoterra.presentation.components.common.SnackbarMessage
import ucr.ac.cr.inii.geoterra.presentation.components.common.SnackbarType
import ucr.ac.cr.inii.geoterra.presentation.screens.account.password.recovery.PasswordRecoveryState

/**
 * ViewModel managing the business logic for the password recovery flow.
 *
 * @property authService The authentication service used to execute network requests.
 */
class PasswordRecoveryViewModel(
	private val authService: AuthService
) : BaseScreenModel<PasswordRecoveryState>(PasswordRecoveryState()) {

	/**
	 * Updates the email state and clears its associated error.
	 *
	 * @param newValue The new email string.
	 */
	fun onEmailChanged(newValue: String) {
		updateState { it.copy(email = newValue, fieldErrors = it.fieldErrors - "email") }
	}

	/**
	 * Updates the OTP token state and clears its associated error.
	 *
	 * @param newValue The new OTP token string.
	 */
	fun onTokenChanged(newValue: String) {
		updateState { it.copy(token = newValue, fieldErrors = it.fieldErrors - "token") }
	}

	/**
	 * Updates the new password state and clears its associated error.
	 *
	 * @param newValue The new password string.
	 */
	fun onPasswordChanged(newValue: String) {
		updateState { it.copy(newPassword = newValue, fieldErrors = it.fieldErrors - "newPassword") }
	}

	/**
	 * Updates the confirm password state.
	 *
	 * @param newValue The confirm password string.
	 */
	fun onConfirmPasswordChanged(newValue: String) {
		updateState { it.copy(confirmPassword = newValue) }
	}

	/**
	 * Toggles the visibility state of the password input field.
	 */
	fun togglePasswordVisibility() {
		updateState { it.copy(isPasswordVisible = !it.isPasswordVisible) }
	}

	/**
	 * Dismisses the currently displayed snackbar message.
	 */
	fun onSnackBarDismissed() {
		updateState { it.copy(snackBarMessage = null) }
	}

	private fun validateEmailField(): Boolean {
		val errors = mutableMapOf<String, String>()
		val email = state.value.email.trim()
		val emailRegex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[a-z]+$".toRegex()

		if (email.isBlank()) {
			errors["email"] = "El correo es requerido."
		} else if (!email.matches(emailRegex)) {
			errors["email"] = "Formato de correo inválido."
		}

		updateState { it.copy(fieldErrors = errors) }
		return errors.isEmpty()
	}

	private fun validateResetFields(): Boolean {
		val errors = mutableMapOf<String, String>()
		val token = state.value.token.trim()
		val password = state.value.newPassword.trim()
		val confirmPassword = state.value.confirmPassword.trim()

		val passwordPattern = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[\\W_]).{8,64}$".toRegex()

		if (token.isBlank()) {
			errors["token"] = "El código OTP es requerido."
		}

		if (password.isBlank()) {
			errors["newPassword"] = "La nueva contraseña es requerida."
		} else if (!password.matches(passwordPattern)) {
			errors["newPassword"] =
				"La contraseña debe tener al menos 8 caracteres, incluir al menos una letra mayúscula, una letra minúscula, un número y un carácter especial."
		} else if (password != confirmPassword) {
			errors["newPassword"] = "Las contraseñas no coinciden."
		}

		updateState { it.copy(fieldErrors = errors) }
		return errors.isEmpty()
	}

	/**
	 * Initiates the password recovery process by requesting an OTP for the provided email.
	 */
	fun requestPasswordReset() {
		updateState {
			it.copy(
				email = it.email.trim(),
				fieldErrors = emptyMap()
			)
		}

		if (!validateEmailField()) return

		updateState { it.copy(isLoading = true) }

		screenModelScope.launch {
			authService.requestPasswordReset(state.value.email)
				.onSuccess {
					updateState {
						it.copy(
							isLoading = false,
							step = PasswordRecoveryState.Step.RESET_PASSWORD,
							snackBarMessage = SnackbarMessage(
								text = "El código OTP ha sido enviado a tu correo.",
								type = SnackbarType.SUCCESS
							)
						)
					}
				}
				.onFailure { error ->
					updateState {
						it.copy(
							isLoading = false,
							snackBarMessage = SnackbarMessage(
								text = error.message ?: "Ha ocurrido un error inesperado.",
								type = SnackbarType.ERROR
							)
						)
					}
				}
		}
	}

	/**
	 * Submits the OTP and the new password to finalize the reset process.
	 */
	fun submitPasswordReset() {
		updateState {
			it.copy(
				token = it.token.trim(),
				newPassword = it.newPassword.trim(),
				confirmPassword = it.confirmPassword.trim(),
				fieldErrors = emptyMap()
			)
		}

		if (!validateResetFields()) return

		updateState { it.copy(isLoading = true) }

		screenModelScope.launch {
			authService.resetPassword(state.value.token, state.value.newPassword)
				.onSuccess {
					updateState {
						it.copy(
							isLoading = false,
							isSuccess = true,
							snackBarMessage = SnackbarMessage(
								text = "Contraseña actualizada correctamente.",
								type = SnackbarType.SUCCESS
							)
						)
					}
				}
				.onFailure { error ->
					updateState {
						it.copy(
							isLoading = false,
							snackBarMessage = SnackbarMessage(
								text = error.message ?: "Error al restablecer la contraseña. Intente nuevamente",
								type = SnackbarType.ERROR
							)
						)
					}
				}
		}
	}
}