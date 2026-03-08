package ucr.ac.cr.inii.geoterra.presentation.screens.editProfile

import cafe.adriel.voyager.core.model.screenModelScope
import kotlinx.coroutines.launch
import ucr.ac.cr.inii.geoterra.data.model.remote.UserRemote
import ucr.ac.cr.inii.geoterra.data.model.remote.UserUpdateRequest
import ucr.ac.cr.inii.geoterra.data.repository.UserRepository
import ucr.ac.cr.inii.geoterra.presentation.base.BaseScreenModel

class EditProfileViewModel(
  private val userProfile: UserRemote,
  private val userRepository: UserRepository
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

  fun onNameChanged(v: String) = updateState { it.copy(name = v, nameError = null) }
  fun onLastnameChanged(v: String) = updateState { it.copy(lastname = v, lastnameError = null) }
  fun onEmailChanged(v: String) = updateState { it.copy(email = v, emailError = null) }
  fun onPhoneChanged(v: String) = updateState { it.copy(phoneNumber = v) }
  fun dismissSnackbar() = updateState { it.copy(snackBarMessage = null) }

  /**
   * Resets success and error status.
   */
  fun clearStatus() = updateState { it.copy(isSuccess = false, errorMessage = null) }

  /**
   * Updates the user profile.
   */
  fun updateProfile() {
    val s = state.value

    if (s.name.isBlank()) return updateState { it.copy(nameError = "Requerido") }
    if (s.email.isBlank() || !s.email.contains("@")) return updateState { it.copy(emailError = "Email inválido") }

    updateState { it.copy(isLoading = true, snackBarMessage = null, errorMessage = null) }

    screenModelScope.launch {
      val request = UserUpdateRequest(
        name = s.name,
        lastname = s.lastname,
        email = s.email,
        phone_number = s.phoneNumber.ifBlank { null }
      )

      userRepository.updateMe(request)
        .onSuccess {
          updateState { it.copy(isLoading = false, isSuccess = true) }
        }
        .onFailure { error ->
          updateState {
            it.copy(
              isLoading = false,
              errorMessage = error.message ?: "Ha ocurrido un error de servidor al actualizar el perfil."
            )
          }
        }
    }
  }

}