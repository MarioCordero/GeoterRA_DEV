package ucr.ac.cr.inii.geoterra.presentation.screens.account.password.change

import cafe.adriel.voyager.core.model.screenModelScope
import kotlinx.coroutines.launch
import ucr.ac.cr.inii.geoterra.data.model.requests.UpdatePasswordRequest
import ucr.ac.cr.inii.geoterra.domain.repository.UserRepositoryInterface
import ucr.ac.cr.inii.geoterra.domain.validation.PasswordValidator
import ucr.ac.cr.inii.geoterra.presentation.base.BaseScreenModel
import ucr.ac.cr.inii.geoterra.presentation.components.common.SnackbarMessage
import ucr.ac.cr.inii.geoterra.presentation.components.common.SnackbarType

class PasswordChangeViewModel(
	private val userRepository: UserRepositoryInterface
) : BaseScreenModel<PasswordChangeState>(PasswordChangeState()) {

	fun onCurrentPasswordChanged(newValue: String) {
		updateState { it.copy(currentPassword = newValue, fieldErrors = it.fieldErrors - "currentPassword") }
	}

	fun onNewPasswordChanged(v: String) = updateState { state ->
		val errorMessage = PasswordValidator.getMissingRequirementsMessage(v)

		val newFieldErrors = if (errorMessage != null) {
			state.fieldErrors + ("newPassword" to errorMessage)
		} else {
			state.fieldErrors - "newPassword"
		}

		state.copy(
			newPassword = v,
			fieldErrors = newFieldErrors
		)
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

		if (currentPassword.isBlank()) {
			errors["currentPassword"] = "La contraseña actual es requerida."
		}

		val passwordError = PasswordValidator.getMissingRequirementsMessage(newPassword)
		if (passwordError != null) {
			errors["newPassword"] = passwordError
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