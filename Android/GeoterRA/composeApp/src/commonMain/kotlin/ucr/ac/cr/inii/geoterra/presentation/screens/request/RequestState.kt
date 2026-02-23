package ucr.ac.cr.inii.geoterra.presentation.screens.request

import ucr.ac.cr.inii.geoterra.data.model.remote.AnalysisRequestRemote

data class RequestState(
  val isLoading: Boolean = false,
  val requests: List<AnalysisRequestRemote> = emptyList(),
  val errorMessage: String? = null
)