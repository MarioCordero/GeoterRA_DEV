package ucr.ac.cr.inii.geoterra.domain.pdf

import androidx.compose.runtime.Composable
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.koin.mp.KoinPlatform.getKoin
import ucr.ac.cr.inii.geoterra.data.model.remote.AnalysisRequestRemote
import ucr.ac.cr.inii.geoterra.presentation.components.analysisform.RequestDetailSheet

object PDFUtil {

  private val pdfManager: PDFManager = getKoin().get()

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
    request: AnalysisRequestRemote,
    fileName: String
  ) : String? {
    val myAuthority = "ucr.ac.cr.inii.geoterra.provider"
    return generatePdf(
      fileName = fileName,
      content = {
        RequestDetailSheet(
          request = request,
          isForPdf = true,
          onDownloadPdf = {}
        )
      },
      shareAfterCreation = false,
      authority = myAuthority
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