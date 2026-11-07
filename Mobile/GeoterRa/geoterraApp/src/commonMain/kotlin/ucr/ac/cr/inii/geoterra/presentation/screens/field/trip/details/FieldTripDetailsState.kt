package ucr.ac.cr.inii.geoterra.presentation.screens.field.trip.details

import ucr.ac.cr.inii.geoterra.data.model.responses.FieldTripResponse
import ucr.ac.cr.inii.geoterra.presentation.components.common.SnackbarMessage

data class FieldTripDetailsState(
	val isLoading: Boolean = false,
	val isPdfGenerating: Boolean = false,
	val lastGeneratedPdfPath: String? = null,
	val pdfError: String? = null,
	val fieldTrip: FieldTripResponse? = null,
	val snackBarMessage: SnackbarMessage? = null
)