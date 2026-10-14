package ucr.ac.cr.inii.geoterra.presentation.screens.field.trip

import ucr.ac.cr.inii.geoterra.data.model.responses.FieldTripResponse
import ucr.ac.cr.inii.geoterra.presentation.components.common.SnackbarMessage

enum class FieldTripTab(val title: String) {
	GENERAL("General"),
	ASSIGNED("Asignadas")
}

data class FieldTripState(
	val isLoading: Boolean = false,
	val isLoggedIn: Boolean = false,
	val currentTab: FieldTripTab = FieldTripTab.GENERAL,
	val generalFieldTrips: List<FieldTripResponse> = emptyList(),
	val myFieldTrips: List<FieldTripResponse> = emptyList(),
	val snackBarMessage: SnackbarMessage? = null
)