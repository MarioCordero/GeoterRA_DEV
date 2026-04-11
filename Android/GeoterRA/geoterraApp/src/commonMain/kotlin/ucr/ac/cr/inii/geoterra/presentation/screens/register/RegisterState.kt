package ucr.ac.cr.inii.geoterra.presentation.screens.register

data class RegisterState(
  val name: String = "",
  val lastname: String = "",
  val email: String = "",
  val phoneNumber: String = "",
  val password: String = "",
  val confirmPassword: String = "",
  val isLoading: Boolean = false,
  val isSuccess: Boolean = false,
  val isPasswordVisible: Boolean = false,
  val snackBarMessage: String? = null,
  val error: String? = null,
  val fieldErrors: Map<String, String> = emptyMap()
)