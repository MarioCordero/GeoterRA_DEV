package ucr.ac.cr.inii.geoterra.presentation.screens.account.edit

import cafe.adriel.voyager.core.model.screenModelScope
import kotlinx.coroutines.launch
import ucr.ac.cr.inii.geoterra.data.model.requests.UserUpdateRequest
import ucr.ac.cr.inii.geoterra.data.model.responses.UserResponse
import ucr.ac.cr.inii.geoterra.domain.repository.UserRepositoryInterface
import ucr.ac.cr.inii.geoterra.presentation.base.BaseScreenModel
import ucr.ac.cr.inii.geoterra.presentation.components.common.SnackbarMessage
import ucr.ac.cr.inii.geoterra.presentation.components.common.SnackbarType

class EditAccountViewModel(
	private val userProfile: UserResponse,
	private val userRepository: UserRepositoryInterface
) : BaseScreenModel<EditAccountState>(EditAccountState()) {

	init {
		updateState {
			it.copy(
				payload = UserUpdateRequest(
					first_name = userProfile.first_name,
					last_name = userProfile.last_name,
					email = userProfile.email,
					phone_number = userProfile.phone_number
				)
			)
		}
	}

	fun onNameChanged(v: String) = updateState {
		it.copy(
			payload = it.payload.copy(first_name = v),
			fieldErrors = it.fieldErrors - "name"
		)
	}

	fun onLastnameChanged(v: String) = updateState {
		it.copy(
			payload = it.payload.copy(last_name = v),
			fieldErrors = it.fieldErrors - "lastname"
		)
	}

	fun onEmailChanged(v: String) = updateState {
		it.copy(
			payload = it.payload.copy(email = v),
			fieldErrors = it.fieldErrors - "email"
		)
	}

	/**
	 * Updates the phone number field within the profile update request payload.
	 * Clears any associated phone validation errors from the current UI state.
	 *
	 * @param v The new phone number string input by the user.
	 */
	fun onPhoneChanged(v: String) = updateState {
		it.copy(
			payload = it.payload.copy(phone_number = v),
			fieldErrors = it.fieldErrors - "phone"
		)
	}

	private fun validateFields(): Boolean {
		val errors = mutableMapOf<String, String>()
		val payload = state.value.payload

		if (payload.first_name.isBlank()) errors["name"] = "Por favor, proporcione un nombre."
		if (payload.last_name.isBlank()) errors["lastname"] = "Por favor, proporcione un apellido."

		val emailRegex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[a-z]+$".toRegex()
		if (payload.email.isBlank()) errors["email"] = "Por favor, proporcione un correo electrónico."
		else if (!payload.email.matches(emailRegex)) errors["email"] =
			"El formato del correo electrónico no es válido."

		if (payload.phone_number?.isNotBlank() == true) {
			val phoneRegex = "^[0-9]{8}$|^[0-9]{4}[- ]?[0-9]{4}$".toRegex()
			if (!payload.phone_number.trim().matches(phoneRegex)) errors["phone"] =
				"Debe ser un número de teléfono válido."
		}

		updateState { it.copy(fieldErrors = errors) }
		return errors.isEmpty()
	}

	/**
	 * Dismisses the snackbar message.
	 */
	fun onSnackbarDismissed() = updateState { it.copy(snackBarMessage = null) }

	/**
	 * Updates the user profile using the unified fieldErrors map.
	 */
	fun updateProfile() {
		updateState {
			it.copy(
				payload = it.payload,
				fieldErrors = emptyMap(),
				snackBarMessage = null
			)
		}

		if (!validateFields()) return

		updateState { it.copy(isLoading = true, isSuccess = false, snackBarMessage = null) }

		screenModelScope.launch {
			val payload = state.value.payload

			val phoneNumberClean = payload.phone_number?.replace("-", "")?.replace(" ", "")

			val request = UserUpdateRequest(
				first_name = payload.first_name,
				last_name = payload.last_name,
				email = payload.email,
				phone_number = phoneNumberClean?.ifBlank { null }
			)

			userRepository.updateMe(request)
				.onSuccess {
					updateState {
						it.copy(
							isLoading = false,
							isSuccess = true,
							snackBarMessage = SnackbarMessage(
								"Perfil actualizado exitosamente.",
								SnackbarType.SUCCESS
							)
						)
					}
				}
				.onFailure { error ->
					updateState {
						it.copy(
							isLoading = false,
							isSuccess = false,
							snackBarMessage = SnackbarMessage(
								error.message ?: "Ha ocurrido un error al actualizar el perfil.",
								SnackbarType.ERROR
							)
						)
					}
				}
		}
	}
}