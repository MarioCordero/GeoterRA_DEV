package ucr.ac.cr.inii.geoterra.presentation.screens.field.insitu.form

import ucr.ac.cr.inii.geoterra.data.model.requests.InSituTestRequest
import ucr.ac.cr.inii.geoterra.presentation.components.common.SnackbarMessage

data class InSituFormState(
	val isLoading: Boolean = false,
	val isSuccess: Boolean = false,
	val request: InSituTestRequest = InSituTestRequest(),
	val geomanifestationName: String = "",
	val temperatureInput: String = "",
	val phInput: String = "",
	val conductivityInput: String = "",
	val snackBarMessage: SnackbarMessage? = null,
	val fieldErrors: Map<String, String> = emptyMap()
)

sealed class InSituFormEvent {
	data class NameChanged(val value: String) : InSituFormEvent()
	data class TemperatureChanged(val value: String) : InSituFormEvent()
	data class PhChanged(val value: String) : InSituFormEvent()
	data class ConductivityChanged(val value: String) : InSituFormEvent()
	data class DescriptionChanged(val value: String) : InSituFormEvent()
	object Submit : InSituFormEvent()
	object ClearSnackBar : InSituFormEvent()
}