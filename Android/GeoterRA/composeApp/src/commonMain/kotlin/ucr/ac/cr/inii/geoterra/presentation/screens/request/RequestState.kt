package ucr.ac.cr.inii.geoterra.presentation.screens.request

import ucr.ac.cr.inii.geoterra.data.model.remote.AnalysisRequestRemote

data class RequestState(
  val isLoading: Boolean = false,
  val isPdfGenerating: Boolean = false,
  val lastGeneratedPdfPath: String? = null,
  val pdfError: String? = null,
  val requests: List<AnalysisRequestRemote> = emptyList(),
  val snackBarMessage: String? = null
)