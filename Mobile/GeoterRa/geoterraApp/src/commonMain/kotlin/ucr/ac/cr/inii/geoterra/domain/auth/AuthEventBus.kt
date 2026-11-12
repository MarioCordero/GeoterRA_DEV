package ucr.ac.cr.inii.geoterra.domain.auth

import kotlinx.coroutines.channels.BufferOverflow
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow

sealed class AuthEvent {
	object Unauthorized : AuthEvent()
	object Authorized : AuthEvent()
	object LoginSuccess : AuthEvent()
	object Logout : AuthEvent()
}

class AuthEventBus {
	private val _events = MutableSharedFlow<AuthEvent>(
		extraBufferCapacity = 16,
		onBufferOverflow = BufferOverflow.DROP_OLDEST
	)
	val events = _events.asSharedFlow()

	private val _isLoggedIn = MutableStateFlow<Boolean?>(null)
	val isLoggedIn: StateFlow<Boolean?> = _isLoggedIn.asStateFlow()

	private val _sessionExpired = MutableStateFlow(false)
	val sessionExpired: StateFlow<Boolean> = _sessionExpired.asStateFlow()

	var onTokensInvalidated: (() -> Unit)? = null

	fun emit(event: AuthEvent) {
		when (event) {
			is AuthEvent.Unauthorized -> {
				_sessionExpired.value = true
				_isLoggedIn.value = false
			}
			is AuthEvent.Logout -> {
				_sessionExpired.value = false
				_isLoggedIn.value = false
			}
			is AuthEvent.LoginSuccess -> {
				_sessionExpired.value = false
				_isLoggedIn.value = true
			}
			is AuthEvent.Authorized -> Unit
		}
		_events.tryEmit(event)
	}

	fun updateLoginState(loggedIn: Boolean) {
		_isLoggedIn.value = loggedIn
	}

	fun clearSessionExpired() {
		_sessionExpired.value = false
	}

	fun invalidateTokenCache() {
		onTokensInvalidated?.invoke()
	}
}