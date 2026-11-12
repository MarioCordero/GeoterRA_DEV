package ucr.ac.cr.inii.geoterra.presentation.screens.investigation.requests.details

import ucr.ac.cr.inii.geoterra.data.model.responses.InvestigationRequestResponse
import ucr.ac.cr.inii.geoterra.presentation.components.common.SnackbarMessage

data class InvestigationRequestDetailsState(
	val isLoading: Boolean = false,
	val isPdfGenerating: Boolean = false,
	val lastGeneratedPdfPath: String? = null,
	val pdfError: String? = null,
	val requestId: String,
	val request: InvestigationRequestResponse? = null,
	val statuses: List<InvestigationRequestResponse.StateResponse> = emptyList(),
	val snackBarMessage: SnackbarMessage? = null
)