package ucr.ac.cr.inii.geoterra.presentation.screens.login

// LoginState.kt
data class LoginState(
    val email: String = "",
    val password: String = "",
    val emailError: String? = null,
    val passwordError: String? = null,
    val isLoading: Boolean = false,
    val isPasswordVisible: Boolean = false,
    val snackbarMessage: String? = null
)