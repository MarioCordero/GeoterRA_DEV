package ucr.ac.cr.inii.geoterra.presentation.screens.register

data class RegisterState(
  val name: String = "",
  val lastname: String = "",
  val email: String = "",
  val phoneNumber: String = "",
  val password: String = "",
  val confirmPassword: String = "",
  val isLoading: Boolean = false,
  val isPasswordVisible: Boolean = false,
  val nameError: String? = null,
  val lastnameError: String? = null,
  val emailError: String? = null,
  val passwordError: String? = null,
  val snackBarMessage: String? = null,
  val isSuccess: Boolean = false,
  val errorMessage: String? = null
)