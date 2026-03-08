package ucr.ac.cr.inii.geoterra.domain.auth

import cafe.adriel.voyager.core.model.ScreenModel
import cafe.adriel.voyager.core.model.screenModelScope
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import ucr.ac.cr.inii.geoterra.domain.repository.AuthRepositoryInterface

class AuthService(
  private val authRepository: AuthRepositoryInterface,
  private val authEventBus: AuthEventBus
) : ScreenModel {
  val isLoggedIn: StateFlow<Boolean?> = authEventBus.isLoggedIn

  init {
    // Coroutine scope for the ViewModel
    screenModelScope.launch {
      // Check if the user is logged in when the ViewModel is created
      val isUserLogged = authRepository.isUserLoggedIn()
      authEventBus.updateLoginState(isUserLogged)

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
      if (isUserLogged) {
        authEventBus.emit(AuthEvent.Authorized)
      }
    }
  }
  
  suspend fun loginSuccess() {
    authEventBus.updateLoginState(true)
    authEventBus.emit(AuthEvent.Authorized)
  }
  
  suspend fun logout() {
    authRepository.logout()
    authEventBus.updateLoginState(false)
  }
  
  suspend fun refreshAccessToken() {
    authRepository.refreshAccessToken()
  }
  
}