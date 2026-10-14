package ucr.ac.cr.inii.geoterra.presentation.screens.fieldtrip

import cafe.adriel.voyager.core.model.screenModelScope
import com.russhwolf.settings.Settings
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import ucr.ac.cr.inii.geoterra.core.network.ApiException
import ucr.ac.cr.inii.geoterra.core.network.isAuthError
import ucr.ac.cr.inii.geoterra.core.network.isInvalidAccess
import ucr.ac.cr.inii.geoterra.domain.auth.AuthEvent
import ucr.ac.cr.inii.geoterra.domain.auth.AuthService
import ucr.ac.cr.inii.geoterra.domain.repository.FieldTripRepositoryInterface
import ucr.ac.cr.inii.geoterra.presentation.base.BaseScreenModel
import ucr.ac.cr.inii.geoterra.presentation.components.common.SnackbarMessage
import ucr.ac.cr.inii.geoterra.presentation.components.common.SnackbarType
import ucr.ac.cr.inii.geoterra.presentation.screens.field.trip.FieldTripState
import ucr.ac.cr.inii.geoterra.presentation.screens.field.trip.FieldTripTab

class FieldTripViewModel(
	private val fieldTripRepository: FieldTripRepositoryInterface,
	private val authService: AuthService
) : BaseScreenModel<FieldTripState>(FieldTripState()) {

	init {
		screenModelScope.launch {
			authService.events.collect { event ->
				when (event) {
					is AuthEvent.Unauthorized -> {
						_state.update { it.copy(isLoggedIn = false, myFieldTrips = emptyList()) }
					}
					is AuthEvent.Authorized -> {
						_state.update { it.copy(isLoggedIn = true) }
						fetchMyFieldTrips()
					}
					else -> {}
				}
			}
		}
		fetchAllData()
	}

	fun fetchAllData() {
		fetchGeneralFieldTrips()
		fetchMyFieldTrips()
	}

	fun selectTab(tab: FieldTripTab) {
		_state.update { it.copy(currentTab = tab) }
	}

	fun fetchGeneralFieldTrips() {
		screenModelScope.launch {
			_state.update { it.copy(isLoading = true, snackBarMessage = null) }
			fieldTripRepository.getFieldTrips()
				.onSuccess { data ->
					_state.update { it.copy(isLoading = false, generalFieldTrips = data) }
				}
				.onFailure { exception ->
					val apiException = exception as? ApiException
					if (!(apiException?.isAuthError() == true || apiException?.isInvalidAccess() == true)) {
						_state.update {
							it.copy(
								isLoading = false,
								snackBarMessage = SnackbarMessage(
									text = apiException?.message ?: "Error al cargar giras generales",
									type = SnackbarType.ERROR
								)
							)
						}
					} else {
						_state.update { it.copy(isLoading = false) }
					}
				}
		}
	}

	fun fetchMyFieldTrips() {
		screenModelScope.launch {
			fieldTripRepository.getMyFieldTrips()
				.onSuccess { data ->
					_state.update { it.copy(myFieldTrips = data) }
				}
				.onFailure { exception ->
					val apiException = exception as? ApiException
					if (!(apiException?.isAuthError() == true || apiException?.isInvalidAccess() == true)) {
						_state.update {
							it.copy(
								snackBarMessage = SnackbarMessage(
									text = apiException?.message ?: "Error al cargar giras asignadas",
									type = SnackbarType.ERROR
								)
							)
						}
					}
				}
		}
	}

	fun updateSnackBarMessage(message: String?, type: SnackbarType = SnackbarType.INFO) {
		_state.update {
			it.copy(
				snackBarMessage = message?.let { text -> SnackbarMessage(text, type) }
			)
		}
	}

	fun clearSnackBarMessage() {
		_state.update { it.copy(snackBarMessage = null) }
	}
}