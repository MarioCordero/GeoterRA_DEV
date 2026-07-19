package ucr.ac.cr.inii.geoterra.presentation.screens.account

import cafe.adriel.voyager.core.model.screenModelScope
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import ucr.ac.cr.inii.geoterra.core.network.ApiException
import ucr.ac.cr.inii.geoterra.core.network.isAuthError
import ucr.ac.cr.inii.geoterra.domain.repository.UserRepositoryInterface
import ucr.ac.cr.inii.geoterra.domain.auth.AuthEvent
import ucr.ac.cr.inii.geoterra.domain.auth.AuthEventBus
import ucr.ac.cr.inii.geoterra.domain.auth.AuthService
import ucr.ac.cr.inii.geoterra.presentation.base.BaseScreenModel

class AccountViewModel(
	private val userRepository: UserRepositoryInterface,
	private val authService: AuthService
) : BaseScreenModel<AccountState>(AccountState()) {

	init {
		screenModelScope.launch {
			authService.events.collect { event ->
				when (event) {
					is AuthEvent.LoginSuccess, is AuthEvent.Authorized -> loadUserProfile()
					is AuthEvent.Logout, is AuthEvent.Unauthorized -> _state.update { it.copy(user = null, isLoading = false) }
				}
			}
		}
	}

	fun loadUserProfile() {
		screenModelScope.launch {
			_state.update { it.copy(isLoading = true, error = null) }
			userRepository.getMe()
				.onSuccess { user -> _state.update { it.copy(user = user, isLoading = false) } }
				.onFailure { e ->
					val exception = e as ApiException
					if (exception.isAuthError()) {
						_state.update { it.copy(error = "Su sesión ha expirado. Inicie sesión nuevamente.", isLoading = false) }
					} else {
						_state.update { it.copy(error = e.message, isLoading = false) }
					}
				}
		}
	}

	fun deleteAccount() {
		screenModelScope.launch {
			_state.update { it.copy(isLoading = true, error = null) }
			userRepository.deleteMe()
				.onSuccess { _state.update { it.copy(isLoading = false) } }
				.onFailure { e -> _state.update { it.copy(error = e.message, isLoading = false) } }
		}
	}

	fun toggleTheme(isDark: Boolean) {
		_state.update { it.copy(isDarkMode = isDark) }

	}

	fun logout() {
		screenModelScope.launch {
			authService.logout()
		}
	}

	fun clearError() {
		_state.update { it.copy(error = null) }
	}
}