package ucr.ac.cr.inii.geoterra.presentation.screens.account

import cafe.adriel.voyager.core.model.screenModelScope
import com.russhwolf.settings.Settings
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import ucr.ac.cr.inii.geoterra.domain.auth.AuthEvent
import ucr.ac.cr.inii.geoterra.domain.auth.AuthService
import ucr.ac.cr.inii.geoterra.domain.repository.UserRepositoryInterface
import ucr.ac.cr.inii.geoterra.presentation.base.BaseScreenModel
import ucr.ac.cr.inii.geoterra.presentation.components.common.SnackbarMessage
import ucr.ac.cr.inii.geoterra.presentation.components.common.SnackbarType

class AccountViewModel(
	private val userRepository: UserRepositoryInterface,
	private val authService: AuthService,
	private val settings: Settings
) : BaseScreenModel<AccountState>(
	AccountState(
		isLoading = authService.userSession.value == null,
		user = authService.userSession.value,
		isDarkMode = settings.getBoolean("is_dark_mode", false),
		isFieldTripMode = settings.getBoolean("is_field_trip_mode", false)
	)
) {

	init {
		screenModelScope.launch {
			authService.userSession.collect { user ->
				_state.update {
					it.copy(user = user, isLoading = false)
				}
			}
		}

		screenModelScope.launch {
			authService.events.collect { event ->
				when (event) {
					is AuthEvent.Unauthorized -> _state.update {
						it.copy(isSessionExpired = true)
					}
					else -> Unit
				}
			}
		}
	}

	fun refreshProfile() {
		screenModelScope.launch {
			authService.fetchAndStoreUserProfile()
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
								e.message ?: "Error al eliminar la cuenta",
								SnackbarType.ERROR
							),
							isLoading = false
						)
					}
				}
		}
	}

	fun toggleTheme(isDark: Boolean) {
		settings.putBoolean("is_dark_mode", isDark)
		_state.update { it.copy(isDarkMode = isDark) }
	}

	fun toggleFieldTripMode(enabled: Boolean) {
		settings.putBoolean("is_field_trip_mode", enabled)
		_state.update { it.copy(isFieldTripMode = enabled) }
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