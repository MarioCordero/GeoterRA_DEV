package ucr.ac.cr.inii.geoterra.presentation.screens.field.trip.details

import ucr.ac.cr.inii.geoterra.data.model.responses.FieldTripResponse
import ucr.ac.cr.inii.geoterra.presentation.components.common.SnackbarMessage

data class FieldTripDetailsState(
	val fieldTrip: FieldTripResponse,
	val snackBarMessage: SnackbarMessage? = null
)