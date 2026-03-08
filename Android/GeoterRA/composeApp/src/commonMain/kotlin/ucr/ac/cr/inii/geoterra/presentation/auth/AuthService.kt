package ucr.ac.cr.inii.geoterra.presentation.auth

import cafe.adriel.voyager.core.model.ScreenModel
import cafe.adriel.voyager.core.model.screenModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import ucr.ac.cr.inii.geoterra.domain.repository.AuthRepositoryInterface

class AuthService(
  private val authRepository: AuthRepositoryInterface,
  private val authEventBus: AuthEventBus
) : ScreenModel {
  private val _isLoggedIn = MutableStateFlow<Boolean?>(null)
  val isLoggedIn = _isLoggedIn.asStateFlow()
  
  init {
    // Coroutine scope for the ViewModel
    screenModelScope.launch {
      // Check if the user is logged in when the ViewModel is created
      _isLoggedIn.value = authRepository.isUserLoggedIn()
      // Subscribe to unauthorized events
      authEventBus.events.collect { event ->
        when (event) {
          is AuthEvent.Login -> {
            val result = authRepository.login(event.request)
            event.response.complete(result)
            if (result.isSuccess) {
              loginSuccess()
            }
          }

          is AuthEvent.Register -> {
            val result = authRepository.register(event.request)
            event.response.complete(result)

          }

          is AuthEvent.Logout -> {
            logout()
            authEventBus.emit(AuthEvent.Unauthorized)
          }

          is AuthEvent.RefreshToken -> {
            refreshAccessToken()
          }
          else -> {}
        }
      }
      if (_isLoggedIn.value == true) {
        authEventBus.emit(AuthEvent.Authorized)
      }
    }
  }
  
  suspend fun loginSuccess() {
    _isLoggedIn.value = true
    authEventBus.updateLoginState(true)
    authEventBus.emit(AuthEvent.Authorized)
  }
  
  suspend fun logout() {
    authRepository.logout()
    _isLoggedIn.value = false
  }
  
  suspend fun refreshAccessToken() {
    authRepository.refreshAccessToken()
  }
  
}