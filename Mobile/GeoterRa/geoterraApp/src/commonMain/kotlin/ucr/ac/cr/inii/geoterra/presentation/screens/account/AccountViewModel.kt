package ucr.ac.cr.inii.geoterra.presentation.screens.account

import cafe.adriel.voyager.core.model.screenModelScope
import com.russhwolf.settings.Settings
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import ucr.ac.cr.inii.geoterra.core.network.ApiException
import ucr.ac.cr.inii.geoterra.core.network.isAuthError
import ucr.ac.cr.inii.geoterra.domain.repository.UserRepositoryInterface
import ucr.ac.cr.inii.geoterra.domain.auth.AuthEvent
import ucr.ac.cr.inii.geoterra.domain.auth.AuthService
import ucr.ac.cr.inii.geoterra.presentation.base.BaseScreenModel
import ucr.ac.cr.inii.geoterra.presentation.components.common.SnackbarMessage
import ucr.ac.cr.inii.geoterra.presentation.components.common.SnackbarType

class AccountViewModel(
	private val userRepository: UserRepositoryInterface,
	private val authService: AuthService,
	private val settings: Settings
) : BaseScreenModel<AccountState>(AccountState(
	isDarkMode = settings.getBoolean("is_dark_mode", false)
)) {

	init {
		screenModelScope.launch {
			authService.events.collect { event ->
				when (event) {
					is AuthEvent.LoginSuccess, is AuthEvent.Authorized -> loadUserProfile()
					is AuthEvent.Logout, is AuthEvent.Unauthorized -> _state.update {
						it.copy(
							user = null,
							isLoading = false
						)
					}
				}
			}
		}
	}

	fun loadUserProfile() {
		screenModelScope.launch {
			_state.update { it.copy(isLoading = true, snackBarMessage = null) }
			userRepository.getMe()
				.onSuccess { user -> _state.update { it.copy(user = user, isLoading = false) } }
				.onFailure { e ->
					val exception = e as ApiException
					if (exception.isAuthError()) {
						_state.update {
							it.copy(
								snackBarMessage = SnackbarMessage(
									"Su sesión ha expirado. Inicie sesión nuevamente.",
									SnackbarType.ERROR
								), isLoading = false
							)
						}
					} else {
						_state.update {
							it.copy(
								snackBarMessage = SnackbarMessage(
									e.message ?: "Error desconocido", SnackbarType.ERROR
								), isLoading = false
							)
						}
					}
				}
		}
	}

	fun deleteAccount() {
		screenModelScope.launch {
			_state.update { it.copy(isLoading = true, snackBarMessage = null) }
			userRepository.deleteMe()
				.onSuccess {
					_state.update {
						it.copy(
							isLoading = false,
							snackBarMessage = SnackbarMessage(
								"Cuenta eliminada exitosamente.",
								SnackbarType.SUCCESS
							)
						)
					}
				}
				.onFailure { e ->
					_state.update {
						it.copy(
							snackBarMessage = SnackbarMessage(
								e.message ?: "Error al eliminar la cuenta", SnackbarType.ERROR
							), isLoading = false
						)
					}
				}
		}
	}

	fun toggleTheme(isDark: Boolean) {
		settings.putBoolean("is_dark_mode", isDark)
		_state.update { it.copy(isDarkMode = isDark) }
	}

	fun logout() {
		screenModelScope.launch {
			authService.logout()
		}
	}

	fun clearSnackBar() {
		_state.update { it.copy(snackBarMessage = null) }
	}
}