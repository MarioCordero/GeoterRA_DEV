package ucr.ac.cr.inii.geoterra.presentation.screens.map.geomanifestation

import ucr.ac.cr.inii.geoterra.data.model.responses.GeomanifestationResponse
import ucr.ac.cr.inii.geoterra.presentation.components.common.SnackbarMessage

data class GeomanifestationState(
	val manifestation: GeomanifestationResponse,
	val isLoading: Boolean = false,
	val isPdfGenerating: Boolean = false,
	val lastGeneratedPdfPath: String? = null,
	val snackBarMessage: SnackbarMessage? = null
)