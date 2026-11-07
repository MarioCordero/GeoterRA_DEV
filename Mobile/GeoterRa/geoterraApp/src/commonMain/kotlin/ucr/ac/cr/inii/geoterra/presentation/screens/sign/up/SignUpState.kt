package ucr.ac.cr.inii.geoterra.presentation.screens.sign

import ucr.ac.cr.inii.geoterra.presentation.components.common.SnackbarMessage

data class SignUpState(
  val name: String = "",
  val lastname: String = "",
  val email: String = "",
  val phoneNumber: String = "",
  val password: String = "",
  val confirmPassword: String = "",
  val isLoading: Boolean = false,
  val isSuccess: Boolean = false,
  val isPasswordVisible: Boolean = false,
	val snackBarMessage: SnackbarMessage? = null,
  val fieldErrors: Map<String, String> = emptyMap()
)