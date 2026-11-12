package ucr.ac.cr.inii.geoterra.presentation.screens.map.geomanifestation

import cafe.adriel.voyager.core.model.screenModelScope
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import ucr.ac.cr.inii.geoterra.core.network.ApiException
import ucr.ac.cr.inii.geoterra.domain.pdf.PDFUtil
import ucr.ac.cr.inii.geoterra.domain.repository.GeomanifestationsRepositoryInterface
import ucr.ac.cr.inii.geoterra.presentation.base.BaseScreenModel
import ucr.ac.cr.inii.geoterra.presentation.components.common.SnackbarMessage
import ucr.ac.cr.inii.geoterra.presentation.components.common.SnackbarType

class GeomanifestationViewModel(
	private val geomanifestationId: String,
	private val repository: GeomanifestationsRepositoryInterface
) : BaseScreenModel<GeomanifestationState>(
	GeomanifestationState(geomanifestationId = geomanifestationId)
) {

	init {
		loadManifestation()
	}

	fun loadManifestation() {
		screenModelScope.launch {
			_state.update { it.copy(isLoading = true, snackBarMessage = null) }

			repository.getPublicGeomanifestationById(_state.value.geomanifestationId)
				.onSuccess { manifestation ->
					_state.update {
						it.copy(isLoading = false, manifestation = manifestation)
					}
				}
				.onFailure { exception ->
					val apiException = exception as? ApiException
					_state.update {
						it.copy(
							isLoading = false,
							snackBarMessage = SnackbarMessage(
								text = apiException?.message ?: "Error al obtener la geomanifestación",
								type = SnackbarType.ERROR
							)
						)
					}
				}
		}
	}

	fun downloadReport() {
		val manifestation = _state.value.manifestation ?: return
		screenModelScope.launch {
			_state.update { it.copy(isPdfGenerating = true) }
			try {
				val fileName = "Reporte_Geoquímico_${manifestation.geomanifestation_name}"
				val resultPath = PDFUtil.generateManifestationReportPdf(_state.value, fileName)

				if (resultPath != null) {
					_state.update { it.copy(lastGeneratedPdfPath = resultPath, isPdfGenerating = false) }
				} else {
					_state.update {
						it.copy(
							snackBarMessage = SnackbarMessage(
								text = "No se pudo generar la ruta del archivo PDF.",
								type = SnackbarType.ERROR
							),
							isPdfGenerating = false,
							lastGeneratedPdfPath = null
						)
					}
				}
			} catch (e: Exception) {
				_state.update {
					it.copy(
						snackBarMessage = SnackbarMessage(
							text = "Error al generar el PDF: ${e.message ?: "Ocurrió un error inesperado."}",
							type = SnackbarType.ERROR
						),
						isPdfGenerating = false,
						lastGeneratedPdfPath = null
					)
				}
			}
		}
	}

	fun clearPdfStatus() {
		_state.update { it.copy(lastGeneratedPdfPath = null, isPdfGenerating = false) }
	}

	fun onSnackbarDismissed() {
		_state.update { it.copy(snackBarMessage = null) }
	}

	fun setGeneratedPdfPath(path: String?) {
		_state.update { it.copy(lastGeneratedPdfPath = path) }
	}

	fun getPdfPath(): String? {
		return _state.value.lastGeneratedPdfPath
	}

	fun updateSnackBarMessage(message: String, type: SnackbarType = SnackbarType.INFO) {
		_state.update { it.copy(snackBarMessage = SnackbarMessage(message, type)) }
	}
}