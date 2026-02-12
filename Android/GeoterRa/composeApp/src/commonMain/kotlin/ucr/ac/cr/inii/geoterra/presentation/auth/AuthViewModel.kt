package ucr.ac.cr.inii.geoterra.presentation.auth

// presentation/auth/AuthViewModel.kt
import cafe.adriel.voyager.core.model.ScreenModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow

class AuthViewModel : ScreenModel {
    private val _isLoggedIn = MutableStateFlow(false) // Por defecto empezamos fuera
    val isLoggedIn = _isLoggedIn.asStateFlow()

    fun loginSuccess() {
        _isLoggedIn.value = true
    }

    fun logout() {
        _isLoggedIn.value = false
    }
}