package ucr.ac.cr.inii.geoterra.presentation.screens.login

// LoginViewModel.kt
import cafe.adriel.voyager.core.model.ScreenModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import ucr.ac.cr.inii.geoterra.presentation.auth.AuthViewModel

class LoginViewModel(private val authViewModel: AuthViewModel) : ScreenModel {    private val _state = MutableStateFlow(LoginState())
    val state = _state.asStateFlow()

    fun onEmailChanged(newValue: String) {
        _state.update { it.copy(email = newValue, emailError = null) }
    }

    fun onPasswordChanged(newValue: String) {
        _state.update { it.copy(password = newValue, passwordError = null) }
    }

    fun togglePasswordVisibility() {
        _state.update { it.copy(isPasswordVisible = !it.isPasswordVisible) }
    }

    fun login() {
        val email = _state.value.email
        val password = _state.value.password

        // Validaciones básicas
        val emailErr = if (!email.contains("@")) "Correo inválido" else null
        val passErr = if (password.length < 6) "Mínimo 6 caracteres" else null

        if (emailErr != null || passErr != null) {
            _state.update { it.copy(emailError = emailErr, passwordError = passErr) }
            return
        }

        if (state.value.email.isNotEmpty() && state.value.password.isNotEmpty()) {
            authViewModel.loginSuccess() // ¡Esto disparará el cambio de pantalla!
        }

//        // Aquí iría la lógica de Network a futuro
//        _state.update { it.copy(isLoading = true) }
    }
}