package ucr.ac.cr.inii.geoterra.domain.auth

import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow

sealed class AuthEvent {
  object Unauthorized : AuthEvent()
  object Authorized : AuthEvent()
  object LoginSuccess : AuthEvent()
  object Logout : AuthEvent()
}

class AuthEventBus {
  private val _events = MutableSharedFlow<AuthEvent>(replay = 1)
  val events = _events.asSharedFlow()

  private val _isLoggedIn = MutableStateFlow<Boolean?>(null)
  val isLoggedIn = _isLoggedIn.asStateFlow()

  suspend fun emit(event: AuthEvent) {
    _events.emit(event)
  }

  fun updateLoginState(loggedIn: Boolean) {
    _isLoggedIn.value = loggedIn
  }
}