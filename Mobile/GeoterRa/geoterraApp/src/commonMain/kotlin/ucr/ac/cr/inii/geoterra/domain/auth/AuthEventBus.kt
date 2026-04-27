package ucr.ac.cr.inii.geoterra.domain.auth

import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import ucr.ac.cr.inii.geoterra.data.model.remote.LoginRequest
import ucr.ac.cr.inii.geoterra.data.model.remote.RegisterRequest

sealed class AuthEvent {
  object Unauthorized : AuthEvent()
  object Authorized : AuthEvent()

  object RefreshToken : AuthEvent()

<<<<<<< Updated upstream
=======
  object LoginSuccess : AuthEvent()

>>>>>>> Stashed changes
  object Logout : AuthEvent()

  data class Login(
    val request: LoginRequest,
    val response: CompletableDeferred<Result<Unit>>
  ) : AuthEvent()

  data class Register(
    val request: RegisterRequest,
    val response: CompletableDeferred<Result<Unit>>
  ) : AuthEvent()
}

class AuthEventBus() {
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