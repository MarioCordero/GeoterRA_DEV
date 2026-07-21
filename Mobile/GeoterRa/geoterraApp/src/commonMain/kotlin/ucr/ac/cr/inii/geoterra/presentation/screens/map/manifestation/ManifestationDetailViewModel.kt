package ucr.ac.cr.inii.geoterra.presentation.screens.map.manifestation

import cafe.adriel.voyager.core.model.screenModelScope
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import ucr.ac.cr.inii.geoterra.data.model.responses.GeomanifestationResponse
import ucr.ac.cr.inii.geoterra.domain.pdf.PDFUtil
import ucr.ac.cr.inii.geoterra.presentation.base.BaseScreenModel
import ucr.ac.cr.inii.geoterra.presentation.components.common.SnackbarMessage
import ucr.ac.cr.inii.geoterra.presentation.components.common.SnackbarType

class ManifestationDetailViewModel(
  private val initialManifestation: GeomanifestationResponse
) : BaseScreenModel<ManifestationDetailState>(ManifestationDetailState(manifestation = initialManifestation)) {
  
  fun downloadReport() {
    screenModelScope.launch {
      _state.update { it.copy(isLoading = true, isPdfGenerating = true) }
      try {
        val fileName = "Reporte_Geoquímico_${initialManifestation.name}"

        // Call the generator and capture the path
        val resultPath = PDFUtil.generateManifestationReportPdf(initialManifestation, fileName)

        if (resultPath != null) {
          _state.update { it.copy(lastGeneratedPdfPath = resultPath) }
        } else {
					_state.update {
						it.copy(
							snackBarMessage = SnackbarMessage(
								text = "No se pudo generar la ruta del archivo PDF.",
								type = SnackbarType.ERROR
							)
						)
					}
				}
      } catch (e: Exception) {
				_state.update {
					it.copy(
						snackBarMessage = SnackbarMessage(
							text = "Error al generar el PDF: ${e.message ?: "Ocurrió un error inesperado."}",
							type = SnackbarType.ERROR
						)
					)
				}
      } finally {
        _state.update { it.copy(isLoading = false, isPdfGenerating = false) }
      }
    }
  }

  /**
   * Resets PDF states after closing the success dialog.
   */
  fun clearPdfStatus() {
    _state.update { it.copy(lastGeneratedPdfPath = null, isPdfGenerating = false) }
  }

  /**
   * Resets the snackbar state after dismissing it.
   */
	fun onSnackbarDismissed() {
		_state.update { it.copy(snackBarMessage = null) }
	}

}