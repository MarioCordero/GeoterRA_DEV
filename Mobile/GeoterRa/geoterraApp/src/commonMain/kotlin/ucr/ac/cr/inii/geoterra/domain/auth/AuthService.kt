package ucr.ac.cr.inii.geoterra.domain.auth

import cafe.adriel.voyager.core.model.ScreenModel
import cafe.adriel.voyager.core.model.screenModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
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
	val events = authEventBus.events

	private val _userSession = MutableStateFlow<UserResponse?>(null)
	val userSession: StateFlow<UserResponse?> = _userSession.asStateFlow()

	val userId: String? get() = _userSession.value?.user_id
	val userEmail: String? get() = _userSession.value?.email
	val userRole: String? get() = _userSession.value?.role

	init {
		screenModelScope.launch {
			val isUserLogged = authRepository.isUserLoggedIn()
			authEventBus.updateLoginState(isUserLogged)

			if (isUserLogged) {
				fetchAndStoreUserProfile()
				authEventBus.emit(AuthEvent.Authorized)
			}

			authEventBus.events.collect { event ->
				when (event) {
					is AuthEvent.LoginSuccess, is AuthEvent.Authorized -> {
						authEventBus.updateLoginState(true)
						fetchAndStoreUserProfile()
					}
					is AuthEvent.Logout -> {
						executeLogoutCleanup()
					}
					is AuthEvent.Unauthorized -> {
						_userSession.value = null
						authEventBus.updateLoginState(false)
						authRepository.logout()
					}
				}
			}
		}
	}

	suspend fun fetchAndStoreUserProfile() {
		userRepository.getMe()
			.onSuccess { user ->
				_userSession.value = user
			}
			.onFailure {
				_userSession.value = null
			}
	}

	fun setCurrentUser(user: UserResponse?) {
		_userSession.value = user
	}

	suspend fun login(request: LoginRequest): Result<Unit> {
		val result = authRepository.login(request)
		if (result.isSuccess) {
			fetchAndStoreUserProfile()
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
		_userSession.value = null
		authRepository.logout()
		authEventBus.updateLoginState(false)
		authEventBus.emit(AuthEvent.Unauthorized)
	}

	suspend fun requestPasswordReset(email: String): Result<Unit> {
		return authRepository.requestPasswordReset(email)
	}

	suspend fun resetPassword(token: String, password: String): Result<Unit> {
		return authRepository.resetPassword(token, password)
	}
}