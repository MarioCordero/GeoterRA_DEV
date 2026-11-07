package ucr.ac.cr.inii.geoterra.presentation.screens.field.geomanifestation.details

import ucr.ac.cr.inii.geoterra.data.model.responses.GeomanifestationResponse
import ucr.ac.cr.inii.geoterra.data.model.responses.InSituTestResponse
import ucr.ac.cr.inii.geoterra.presentation.components.common.SnackbarMessage

data class GeomanifestationDetailsState(
	val isLoading: Boolean = false,
	val geomanifestation: GeomanifestationResponse? = null,
	val inSituTests: List<InSituTestResponse> = emptyList(),
	val snackBarMessage: SnackbarMessage? = null
)