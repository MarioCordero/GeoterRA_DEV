package ucr.ac.cr.inii.geoterra.domain.pdf

import androidx.compose.runtime.Composable
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.koin.mp.KoinPlatform.getKoin
import ucr.ac.cr.inii.geoterra.data.model.responses.InvestigationRequestResponse
import ucr.ac.cr.inii.geoterra.data.model.responses.GeomanifestationResponse
import ucr.ac.cr.inii.geoterra.presentation.components.manifestation.ManifestationReport
import ucr.ac.cr.inii.geoterra.presentation.components.request.RequestBottomModalContent

object PDFUtil {

  private val pdfManager: PDFManager = getKoin().get()

  private const val AUTHORITY = "ucr.ac.cr.inii.geoterra.provider"

  private suspend fun generatePdf(
    fileName: String,
    content: @Composable () -> Unit,
    shareAfterCreation: Boolean = false,
    authority:String=""
  ): String? = withContext(Dispatchers.Default) {
    // ADDED FIX: Retrieve the instance from Koin instead of manual instantiation
    val pdfPath = pdfManager.createPdfFromComposable(fileName, content)

    if (shareAfterCreation && pdfPath != null) {
      pdfManager.openPdf(pdfPath,authority)
    }

    return@withContext pdfPath
  }

  suspend fun generateRequestPdf(
    request: InvestigationRequestResponse,
    fileName: String
  ) : String? {
    return generatePdf(
      fileName = fileName,
      content = {
        RequestBottomModalContent(
          request = request,
          isForPdf = true,
          onDownloadPdf = {}
        )
      },
      shareAfterCreation = false,
      authority = AUTHORITY
    )
  }

  suspend fun generateManifestationReportPdf(
		manifestation: GeomanifestationResponse,
	  fileName: String
  ) : String? {
    return generatePdf(
      fileName = fileName,
      content = {
        ManifestationReport(
          manifestation = manifestation,
          isForPdf = true,
        )
      },
      shareAfterCreation = false,
      authority = AUTHORITY
    )
  }

  /**
   * Share the generated PDF file
   * @param filePath Path to the PDF file
   */
  fun openPdf(filePath: String, authority:String) {
    pdfManager.openPdf(filePath,authority)
  }
}