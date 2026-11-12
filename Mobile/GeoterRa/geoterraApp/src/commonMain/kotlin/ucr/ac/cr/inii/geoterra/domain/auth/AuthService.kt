package ucr.ac.cr.inii.geoterra.domain.auth

import cafe.adriel.voyager.core.model.ScreenModel
import cafe.adriel.voyager.core.model.screenModelScope
import kotlinx.coroutines.CoroutineStart
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.sync.Mutex
import ucr.ac.cr.inii.geoterra.data.model.requests.LoginRequest
import ucr.ac.cr.inii.geoterra.data.model.requests.RegisterRequest
import ucr.ac.cr.inii.geoterra.data.model.responses.UserResponse
import ucr.ac.cr.inii.geoterra.domain.repository.AuthRepositoryInterface
import ucr.ac.cr.inii.geoterra.domain.repository.UserRepositoryInterface

class AuthService(
	private val authRepository: AuthRepositoryInterface,
	private val userRepository: UserRepositoryInterface,
	private val authEventBus: AuthEventBus
) : ScreenModel {

	val isLoggedIn: StateFlow<Boolean?> = authEventBus.isLoggedIn
	val sessionExpired: StateFlow<Boolean> = authEventBus.sessionExpired
	val events = authEventBus.events

	private val _userSession = MutableStateFlow<UserResponse?>(null)
	val userSession: StateFlow<UserResponse?> = _userSession.asStateFlow()

	private val fetchMutex = Mutex()
	private var pendingLogout: Job? = null

	val userId: String? get() = _userSession.value?.user_id
	val userEmail: String? get() = _userSession.value?.email
	val userRole: String? get() = _userSession.value?.role

	init {
		screenModelScope.launch(start = CoroutineStart.UNDISPATCHED) {
			authEventBus.events.collect { event -> handleEvent(event) }
		}

		screenModelScope.launch {
			val isUserLogged = authRepository.isUserLoggedIn()
			if (authEventBus.isLoggedIn.value == null) {
				if (isUserLogged) {
					fetchAndStoreUserProfile()
				}
				if (authEventBus.isLoggedIn.value == null) {
					authEventBus.updateLoginState(isUserLogged)
				}
			}
		}
	}

	private fun handleEvent(event: AuthEvent) {
		when (event) {
			is AuthEvent.LoginSuccess -> Unit
			is AuthEvent.Authorized -> Unit
			is AuthEvent.Unauthorized -> {
				if (authEventBus.isLoggedIn.value == false) {
					_userSession.value = null
					authEventBus.invalidateTokenCache()
				}
			}
			is AuthEvent.Logout -> {
				if (authEventBus.isLoggedIn.value == false) {
					_userSession.value = null
					authEventBus.invalidateTokenCache()
					pendingLogout = screenModelScope.launch {
						authRepository.logout()
					}
				}
			}
		}
	}

	suspend fun fetchAndStoreUserProfile() {
		if (!fetchMutex.tryLock()) return
		try {
			userRepository.getMe()
				.onSuccess { user -> _userSession.value = user }
				.onFailure { _userSession.value = null }
		} finally {
			fetchMutex.unlock()
		}
	}

	fun setCurrentUser(user: UserResponse?) {
		_userSession.value = user
	}

	suspend fun login(request: LoginRequest): Result<Unit> {
		pendingLogout?.join()
		pendingLogout = null

		val result = authRepository.login(request)
		if (result.isFailure) return result

		authEventBus.clearSessionExpired()
		authEventBus.invalidateTokenCache()

		fetchAndStoreUserProfile()

		if (_userSession.value == null) {
			return Result.failure(Exception("No se pudo obtener la información del usuario."))
		}

		authEventBus.emit(AuthEvent.LoginSuccess)
		return result
	}

	suspend fun register(request: RegisterRequest): Result<Unit> {
		return authRepository.register(request)
	}

	fun logout() {
		authEventBus.emit(AuthEvent.Logout)
	}

	suspend fun requestPasswordReset(email: String): Result<Unit> {
		return authRepository.requestPasswordReset(email)
	}

	suspend fun resetPassword(token: String, password: String): Result<Unit> {
		return authRepository.resetPassword(token, password)
	}
}