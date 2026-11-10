package ucr.ac.cr.inii.geoterra.presentation.screens.fieldtrip

import cafe.adriel.voyager.core.model.screenModelScope
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import ucr.ac.cr.inii.geoterra.core.network.ApiException
import ucr.ac.cr.inii.geoterra.core.network.isAuthError
import ucr.ac.cr.inii.geoterra.core.network.isInvalidAccess
import ucr.ac.cr.inii.geoterra.data.model.responses.FieldTripResponse
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
						_state.update {
							it.copy(
								isLoggedIn = false,
								myFieldTrips = emptyList(),
								currentUserId = null,
								currentUserRole = null
							)
						}
					}
					is AuthEvent.Authorized, is AuthEvent.LoginSuccess -> {
						_state.update {
							it.copy(
								isLoggedIn = true,
								currentUserId = authService.userId,
								currentUserRole = authService.userRole
							)
						}
						fetchMyFieldTrips()
					}
					else -> {}
				}
			}
		}
		_state.update {
			it.copy(
				currentUserId = authService.userId,
				currentUserRole = authService.userRole
			)
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
					_state.update { it.copy(isLoading = false, generalFieldTrips = data.data) }
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
					_state.update { it.copy(myFieldTrips = data.data) }
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

	fun setFieldTripToDelete(fieldTrip: FieldTripResponse?) {
		_state.update { it.copy(fieldTripToDelete = fieldTrip) }
	}

	fun deleteFieldTrip(fieldTripId: String) {
		screenModelScope.launch {
			_state.update { it.copy(isLoading = true, fieldTripToDelete = null) }
			fieldTripRepository.deleteFieldTrip(fieldTripId)
				.onSuccess {
					_state.update {
						it.copy(
							isLoading = false,
							snackBarMessage = SnackbarMessage(
								text = "Gira de campo eliminada correctamente",
								type = SnackbarType.SUCCESS
							),
							generalFieldTrips = it.generalFieldTrips.filter { trip -> trip.field_trip_id != fieldTripId },
							myFieldTrips = it.myFieldTrips.filter { trip -> trip.field_trip_id != fieldTripId }
						)
					}
				}
				.onFailure { exception ->
					_state.update {
						it.copy(
							isLoading = false,
							snackBarMessage = SnackbarMessage(
								text = exception.message ?: "Error al eliminar la gira de campo",
								type = SnackbarType.ERROR
							)
						)
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