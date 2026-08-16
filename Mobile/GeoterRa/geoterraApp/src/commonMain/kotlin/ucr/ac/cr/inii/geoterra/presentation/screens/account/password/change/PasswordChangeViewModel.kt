package ucr.ac.cr.inii.geoterra.presentation.screens.account.password.change

import cafe.adriel.voyager.core.model.screenModelScope
import kotlinx.coroutines.launch
import ucr.ac.cr.inii.geoterra.data.model.requests.UpdatePasswordRequest
import ucr.ac.cr.inii.geoterra.domain.repository.UserRepositoryInterface
import ucr.ac.cr.inii.geoterra.presentation.base.BaseScreenModel
import ucr.ac.cr.inii.geoterra.presentation.components.common.SnackbarMessage
import ucr.ac.cr.inii.geoterra.presentation.components.common.SnackbarType

class PasswordChangeViewModel(
	private val userRepository: UserRepositoryInterface
) : BaseScreenModel<PasswordChangeState>(PasswordChangeState()) {

	fun onCurrentPasswordChanged(newValue: String) {
		updateState { it.copy(currentPassword = newValue, fieldErrors = it.fieldErrors - "currentPassword") }
	}

	fun onNewPasswordChanged(newValue: String) {
		updateState { it.copy(newPassword = newValue, fieldErrors = it.fieldErrors - "newPassword") }
	}

	fun onConfirmPasswordChanged(newValue: String) {
		updateState { it.copy(confirmPassword = newValue) }
	}

	fun togglePasswordVisibility() {
		updateState { it.copy(isPasswordVisible = !it.isPasswordVisible) }
	}

	fun onSnackBarDismissed() {
		updateState { it.copy(snackBarMessage = null) }
	}

	private fun validateFields(): Boolean {
		val errors = mutableMapOf<String, String>()
		val currentPassword = state.value.currentPassword.trim()
		val newPassword = state.value.newPassword.trim()
		val confirmPassword = state.value.confirmPassword.trim()

		val passwordPattern = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[\\W_]).{8,64}$".toRegex()

		if (currentPassword.isBlank()) {
			errors["currentPassword"] = "La contraseña actual es requerida."
		}

		if (newPassword.isBlank()) {
			errors["newPassword"] = "La nueva contraseña es requerida."
		} else if (!newPassword.matches(passwordPattern)) {
			errors["newPassword"] = "La contraseña debe tener al menos 8 caracteres, incluir al menos una letra mayúscula, una letra minúscula, un número y un carácter especial."
		} else if (newPassword != confirmPassword) {
			errors["newPassword"] = "Las contraseñas no coinciden."
		} else if (currentPassword == newPassword) {
			errors["newPassword"] = "La nueva contraseña no puede ser igual a la actual."
		}

		updateState { it.copy(fieldErrors = errors) }
		return errors.isEmpty()
	}

	fun submitPasswordChange() {
		updateState {
			it.copy(
				currentPassword = it.currentPassword.trim(),
				newPassword = it.newPassword.trim(),
				confirmPassword = it.confirmPassword.trim(),
				fieldErrors = emptyMap()
			)
		}

		if (!validateFields()) return

		updateState { it.copy(isLoading = true) }

		screenModelScope.launch {
			val request = UpdatePasswordRequest(
				current_password = state.value.currentPassword,
				new_password = state.value.newPassword
			)

			userRepository.updatePassword(request)
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
								text = error.message ?: "Error al actualizar la contraseña.",
								type = SnackbarType.ERROR
							)
						)
					}
				}
		}
	}
}