package ucr.ac.cr.inii.geoterra.presentation.screens.editProfile

import ucr.ac.cr.inii.geoterra.data.model.requests.UserUpdateRequest

data class EditProfileState(
  val payload: UserUpdateRequest = UserUpdateRequest(),
  val isLoading: Boolean = false,
  val fieldErrors: Map<String, String> = emptyMap(),
  val error: String? = null,
  val snackBarMessage: String? = null,
  val isSuccess: Boolean = false,
) {}