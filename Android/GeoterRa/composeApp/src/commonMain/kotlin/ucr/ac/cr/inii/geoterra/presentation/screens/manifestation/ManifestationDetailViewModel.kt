package ucr.ac.cr.inii.geoterra.presentation.screens.manifestation

import cafe.adriel.voyager.core.model.screenModelScope
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import ucr.ac.cr.inii.geoterra.data.model.remote.ManifestationRemote
import ucr.ac.cr.inii.geoterra.domain.pdf.PDFUtil
import ucr.ac.cr.inii.geoterra.presentation.base.BaseScreenModel

class ManifestationDetailViewModel(
  private val initialManifestation: ManifestationRemote
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
        }
      } catch (e: Exception) {
        _state.update { it.copy(pdfError = "Error al generar PDF: ${e.message}") }
        e.printStackTrace()
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
   * Resets PDF states after closing the status dialog.
   */
  fun clearPdfError() {
    _state.update { it.copy(pdfError = null) }
  }

}