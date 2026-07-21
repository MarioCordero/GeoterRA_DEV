package ucr.ac.cr.inii.geoterra.presentation.screens.login

import ucr.ac.cr.inii.geoterra.presentation.components.common.SnackbarMessage

data class LoginState(
  val email: String = "",
  val password: String = "",
  val isPasswordVisible: Boolean = false,
  val isLoading: Boolean = false,
  val isSuccess: Boolean = false,
  val fieldErrors: Map<String, String> = emptyMap(),
	val snackBarMessage: SnackbarMessage? = null
)