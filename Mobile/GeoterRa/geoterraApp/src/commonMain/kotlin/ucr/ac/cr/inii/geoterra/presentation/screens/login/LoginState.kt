package ucr.ac.cr.inii.geoterra.presentation.screens.login

// LoginState.kt
data class LoginState(
  val email: String = "",
  val password: String = "",
  val isPasswordVisible: Boolean = false,
  val isLoading: Boolean = false,
  val isSuccess: Boolean = false,
  val error: String? = null,
  val fieldErrors: Map<String, String> = emptyMap(),
  val snackBarMessage: String? = null
)