package ucr.ac.cr.inii.geoterra.presentation.screens.account.edit

import ucr.ac.cr.inii.geoterra.data.model.requests.UserUpdateRequest
import ucr.ac.cr.inii.geoterra.presentation.components.common.SnackbarMessage

data class EditAccountState(
  val payload: UserUpdateRequest = UserUpdateRequest(),
  val isLoading: Boolean = false,
  val fieldErrors: Map<String, String> = emptyMap(),
  val snackBarMessage: SnackbarMessage? = null,
  val isSuccess: Boolean = false,
) {}