package ucr.ac.cr.inii.geoterra.presentation.screens.manifestation

import ucr.ac.cr.inii.geoterra.data.model.responses.GeomanifestationResponse

data class ManifestationDetailState(
	val manifestation: GeomanifestationResponse? = null,
	val isLoading: Boolean = false,
	val isPdfGenerating: Boolean = false,
	val lastGeneratedPdfPath: String? = null,
	val pdfError: String? = null,
	val error: String? = null
)