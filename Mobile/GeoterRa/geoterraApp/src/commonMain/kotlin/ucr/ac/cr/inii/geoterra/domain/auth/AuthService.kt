package ucr.ac.cr.inii.geoterra.domain.auth

import cafe.adriel.voyager.core.model.ScreenModel
import cafe.adriel.voyager.core.model.screenModelScope
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import ucr.ac.cr.inii.geoterra.data.model.requests.LoginRequest
import ucr.ac.cr.inii.geoterra.data.model.requests.RegisterRequest
import ucr.ac.cr.inii.geoterra.domain.repository.AuthRepositoryInterface

class AuthService(
  private val authRepository: AuthRepositoryInterface,
  private val authEventBus: AuthEventBus
) : ScreenModel {
  val isLoggedIn: StateFlow<Boolean?> = authEventBus.isLoggedIn
  val events = authEventBus.events

  init {
    screenModelScope.launch {
      val isUserLogged = authRepository.isUserLoggedIn()
      authEventBus.updateLoginState(isUserLogged)

      if (isUserLogged) {
        authEventBus.emit(AuthEvent.Authorized)
      }

      authEventBus.events.collect { event ->
        when (event) {
          is AuthEvent.Logout -> {
            executeLogoutCleanup()
          }
          is AuthEvent.RefreshToken -> {
            authRepository.refreshAccessToken()
          }
          else -> {}
        }
      }
    }
  }

  suspend fun login(request: LoginRequest): Result<Unit> {
    val result = authRepository.login(request)
    if (result.isSuccess) {
      authEventBus.emit(AuthEvent.LoginSuccess)
      authEventBus.updateLoginState(true)
      authEventBus.emit(AuthEvent.Authorized)
    }
    return result
  }

  suspend fun register(request: RegisterRequest): Result<Unit> {
    return authRepository.register(request)
  }

  suspend fun logout() {
    authEventBus.emit(AuthEvent.Logout)
  }

  private suspend fun executeLogoutCleanup() {
    authRepository.logout()
    authEventBus.updateLoginState(false)
    authEventBus.emit(AuthEvent.Unauthorized)
  }
}