package ucr.ac.cr.inii.geoterra.presentation.screens.analysisform

data class AnalysisFormState(
  val isLoading: Boolean = false,
  val isSuccess: Boolean = false,
  val regionId: UInt? = null,
  val email: String = "",
  val ownerName: String = "",
  val ownerContact: String = "",
  val temperatureSensation: String = "",
  val bubbles: Int = 0,
  val currentUsage: String = "",
  val details: String = "",
  val latitude: String = "",
  val longitude: String = "",
  val isEditing: Boolean = false,
  val snackBarMessage: String? = null,
  val error: String? = null,
  val fieldErrors: Map<String, String> = emptyMap()
)

sealed class AnalysisFormEvent {
  data class RegionChanged(val value: UInt) : AnalysisFormEvent()
  data class EmailChanged(val value: String) : AnalysisFormEvent()
  data class OwnerNameChanged(val value: String) : AnalysisFormEvent()
  data class OwnerContactChanged(val value: String) : AnalysisFormEvent()
  data class UsageChanged(val value: String) : AnalysisFormEvent()
  data class TempChanged(val value: String) : AnalysisFormEvent()
  data class BubblesChanged(val value: Int) : AnalysisFormEvent()
  data class LatChanged(val value: String) : AnalysisFormEvent()
  data class LonChanged(val value: String) : AnalysisFormEvent()
  data class DetailsChanged(val value: String) : AnalysisFormEvent()
  object Submit : AnalysisFormEvent()
  object UseCurrentLocation : AnalysisFormEvent()

  data class ShowSnackBar(val message: String) : AnalysisFormEvent()
}