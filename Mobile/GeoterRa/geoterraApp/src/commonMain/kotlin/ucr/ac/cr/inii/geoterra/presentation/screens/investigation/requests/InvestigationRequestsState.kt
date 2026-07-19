package ucr.ac.cr.inii.geoterra.presentation.screens.investigation.requests

import ucr.ac.cr.inii.geoterra.data.model.responses.InvestigationRequestResponse

data class InvestigationRequestsState(
  val isLoading: Boolean = false,
  val isLoggedIn: Boolean = false,
  val isPdfGenerating: Boolean = false,
  val lastGeneratedPdfPath: String? = null,
  val pdfError: String? = null,
  val requests: List<InvestigationRequestResponse> = emptyList(),
  val snackBarMessage: String? = null,
  val requestToDelete: InvestigationRequestResponse? = null
)