package ucr.ac.cr.inii.geoterra.presentation.screens.editProfile

import cafe.adriel.voyager.core.model.screenModelScope
import kotlinx.coroutines.launch
import ucr.ac.cr.inii.geoterra.data.model.remote.UserRemote
import ucr.ac.cr.inii.geoterra.data.model.remote.UserUpdateRequest
import ucr.ac.cr.inii.geoterra.data.repository.UserRepository
import ucr.ac.cr.inii.geoterra.domain.repository.UserRepositoryInterface
import ucr.ac.cr.inii.geoterra.presentation.base.BaseScreenModel

class EditProfileViewModel(
  private val userProfile: UserRemote,
  private val userRepository: UserRepositoryInterface
) : BaseScreenModel<EditProfileState>(EditProfileState()) {

  init {
    updateState {
      it.copy(
        name = userProfile.first_name,
        lastname = userProfile.last_name,
        email = userProfile.email,
        phoneNumber = userProfile.phone_number ?: ""
      )
    }
  }

  fun onNameChanged(v: String) = updateState {
    it.copy(
      name = v,
      fieldErrors = it.fieldErrors - "name"
    )
  }

  fun onLastnameChanged(v: String) = updateState {
    it.copy(
      lastname = v,
      fieldErrors = it.fieldErrors - "lastname"
    )
  }

  fun onEmailChanged(v: String) = updateState {
    it.copy(
      email = v,
      fieldErrors = it.fieldErrors - "email"
    )
  }

  fun onPhoneChanged(v: String) = updateState {
    it.copy(
      phoneNumber = v,
      fieldErrors = it.fieldErrors - "phone"
    )
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

    updateState { it.copy(fieldErrors = errors) }
    return errors.isEmpty()
  }
  fun dismissSnackbar() = updateState { it.copy(snackBarMessage = null) }

  /**
   * Resets success and error status.
   */
  fun clearStatus() = updateState { it.copy(isSuccess = false, error = null) }

  /**
   * Updates the user profile using the unified fieldErrors map.
   */
  fun updateProfile() {
    updateState {
      it.copy(
        name = it.name.trim(),
        lastname = it.lastname.trim(),
        email = it.email.trim(),
        phoneNumber = it.phoneNumber.trim(),
        fieldErrors = emptyMap(),
        error = null
      )
    }

    if (!validateFields()) return

    updateState { it.copy(isLoading = true, snackBarMessage = null, error = null) }

    screenModelScope.launch {
      val s = state.value

      val cleanPhone = s.phoneNumber.replace("-", "").replace(" ", "")

      val request = UserUpdateRequest(
        name = s.name,
        lastname = s.lastname,
        email = s.email,
        phone_number = cleanPhone.ifBlank { null }
      )

      userRepository.updateMe(request)
        .onSuccess {
          updateState { it.copy(isLoading = false, isSuccess = true) }
        }
        .onFailure { error ->
          updateState {
            it.copy(
              isLoading = false,
              error = error.message ?: "Ha ocurrido un error al actualizar el perfil."
            )
          }
        }
    }
  }

}