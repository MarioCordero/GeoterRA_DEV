package ucr.ac.cr.inii.geoterra.presentation.screens.geomanifestation.form

import ucr.ac.cr.inii.geoterra.data.model.requests.GeomanifestationRequest
import ucr.ac.cr.inii.geoterra.data.model.responses.CantonResponse
import ucr.ac.cr.inii.geoterra.data.model.responses.DistrictResponse
import ucr.ac.cr.inii.geoterra.data.model.responses.ProvinceResponse
import ucr.ac.cr.inii.geoterra.presentation.components.common.SnackbarMessage

data class GeomanifestationFormState(
	val isLoading: Boolean = false,
	val isSuccess: Boolean = false,
	val availableProvinces: List<ProvinceResponse> = emptyList(),
	val availableCantons: List<CantonResponse> = emptyList(),
	val availableDistricts: List<DistrictResponse> = emptyList(),
	val request: GeomanifestationRequest = GeomanifestationRequest(
		geomanifestation_name = "",
		description = "",
		province_snit_code = 0,
		canton_snit_code = 0,
		district_snit_code = 0,
		latitude = 0.0,
		longitude = 0.0,
		visibility = false
	),
	val snackBarMessage: SnackbarMessage? = null,
	val fieldErrors: Map<String, String> = emptyMap()
)

sealed class GeomanifestationFormEvent {
	data class NameChanged(val value: String) : GeomanifestationFormEvent()
	data class DescriptionChanged(val value: String) : GeomanifestationFormEvent()
	data class ProvinceChanged(val snitCode: Int?) : GeomanifestationFormEvent()
	data class CantonChanged(val snitCode: Int?) : GeomanifestationFormEvent()
	data class DistrictChanged(val snitCode: Int?) : GeomanifestationFormEvent()
	data class LatitudeChanged(val value: String) : GeomanifestationFormEvent()
	data class LongitudeChanged(val value: String) : GeomanifestationFormEvent()
	data class VisibilityChanged(val value: Boolean) : GeomanifestationFormEvent()
	object Submit : GeomanifestationFormEvent()
	object ClearSnackBar : GeomanifestationFormEvent()
}

