package ucr.ac.cr.inii.geoterra.presentation.screens.investigation.requests

import ucr.ac.cr.inii.geoterra.data.model.responses.InvestigationRequestResponse
import ucr.ac.cr.inii.geoterra.presentation.components.common.SnackbarMessage

data class InvestigationRequestsState(
	val isLoading: Boolean = false,
	val isLoggedIn: Boolean = false,
	val isPdfGenerating: Boolean = false,
	val lastGeneratedPdfPath: String? = null,
	val pdfError: String? = null,
	val requests: List<InvestigationRequestResponse> = emptyList(),
	val snackBarMessage: SnackbarMessage? = null,
	val requestToDelete: InvestigationRequestResponse? = null
)