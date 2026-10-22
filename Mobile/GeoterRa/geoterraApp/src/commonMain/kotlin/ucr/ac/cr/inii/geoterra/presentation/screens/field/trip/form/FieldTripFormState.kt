package ucr.ac.cr.inii.geoterra.presentation.screens.fieldtrip.form

import ucr.ac.cr.inii.geoterra.data.model.requests.FieldTripRequest
import ucr.ac.cr.inii.geoterra.data.model.responses.CantonResponse
import ucr.ac.cr.inii.geoterra.data.model.responses.DistrictResponse
import ucr.ac.cr.inii.geoterra.data.model.responses.ProvinceResponse
import ucr.ac.cr.inii.geoterra.presentation.components.common.SnackbarMessage

data class FieldTripFormState(
	val isLoading: Boolean = false,
	val isSuccess: Boolean = false,
	val availableProvinces: List<ProvinceResponse> = emptyList(),
	val availableCantons: List<CantonResponse> = emptyList(),
	val availableDistricts: List<DistrictResponse> = emptyList(),
	val request: FieldTripRequest = FieldTripRequest(),
	val snackBarMessage: SnackbarMessage? = null,
	val fieldErrors: Map<String, String> = emptyMap()
)

sealed class FieldTripFormEvent {
	data class NameChanged(val value: String) : FieldTripFormEvent()
	data class ScheduledDateChanged(val value: String) : FieldTripFormEvent()
	data class StartDateChanged(val value: String) : FieldTripFormEvent()
	data class FinishDateChanged(val value: String) : FieldTripFormEvent()
	data class ActiveStatusChanged(val value: Boolean) : FieldTripFormEvent()
	data class ProvinceChanged(val snitCode: Int?) : FieldTripFormEvent()
	data class CantonChanged(val snitCode: Int?) : FieldTripFormEvent()
	data class DistrictChanged(val snitCode: Int?) : FieldTripFormEvent()
	object Submit : FieldTripFormEvent()
	data class ShowSnackBar(val message: SnackbarMessage) : FieldTripFormEvent()
	object ClearSnackBar : FieldTripFormEvent()
}