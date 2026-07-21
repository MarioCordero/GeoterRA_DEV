package ucr.ac.cr.inii.geoterra.presentation.screens.investigation.requests.form

import ucr.ac.cr.inii.geoterra.data.model.responses.CantonResponse
import ucr.ac.cr.inii.geoterra.data.model.responses.DistrictResponse
import ucr.ac.cr.inii.geoterra.data.model.responses.InvestigationRequestRequest
import ucr.ac.cr.inii.geoterra.data.model.responses.ProvinceResponse
import ucr.ac.cr.inii.geoterra.presentation.components.common.SnackbarMessage

data class InvestigationRequestFormState(
  val isLoading: Boolean = false,
  val isSuccess: Boolean = false,
  val availableProvinces: List<ProvinceResponse> = emptyList(),
  val availableCantons: List<CantonResponse> = emptyList(),
  val availableDistricts: List<DistrictResponse> = emptyList(),
  val request: InvestigationRequestRequest = InvestigationRequestRequest(),
	val snackBarMessage: SnackbarMessage? = null,
  val fieldErrors: Map<String, String> = emptyMap()
)

sealed class AnalysisFormEvent {
  data class ProvinceChanged(val snitCode: Int?) : AnalysisFormEvent()
  data class CantonChanged(val snitCode: Int?) : AnalysisFormEvent()
  data class DistrictChanged(val snitCode: Int?) : AnalysisFormEvent()
  data class OwnerEmailChanged(val value: String) : AnalysisFormEvent()
  data class OwnerNameChanged(val value: String) : AnalysisFormEvent()
  data class OwnerPhoneChanged(val value: String) : AnalysisFormEvent()
  data class UsageChanged(val value: String) : AnalysisFormEvent()
  data class TempChanged(val value: String) : AnalysisFormEvent()
  data class BubblesChanged(val value: Boolean) : AnalysisFormEvent()
  data class LatChanged(val value: String) : AnalysisFormEvent()
  data class LonChanged(val value: String) : AnalysisFormEvent()
  data class DetailsChanged(val value: String) : AnalysisFormEvent()
  data class ExactAddressChanged(val value: String) : AnalysisFormEvent()
  data class RelationChanged(val value: String) : AnalysisFormEvent()
  object Submit : AnalysisFormEvent()
  object UseCurrentLocation : AnalysisFormEvent()
	data class ShowSnackBar(val message: SnackbarMessage) : AnalysisFormEvent()
	object ClearSnackBar : AnalysisFormEvent()
}