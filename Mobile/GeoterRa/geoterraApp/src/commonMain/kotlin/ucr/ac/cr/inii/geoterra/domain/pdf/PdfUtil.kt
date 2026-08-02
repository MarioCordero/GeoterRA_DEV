package ucr.ac.cr.inii.geoterra.domain.pdf

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.koin.mp.KoinPlatform.getKoin
import ucr.ac.cr.inii.geoterra.data.model.responses.GeomanifestationResponse
import ucr.ac.cr.inii.geoterra.presentation.screens.investigation.requests.details.InvestigationRequestDetailsContent
import ucr.ac.cr.inii.geoterra.presentation.screens.investigation.requests.details.InvestigationRequestDetailsState
import ucr.ac.cr.inii.geoterra.presentation.screens.map.geomanifestation.GeomanifestationContent
import ucr.ac.cr.inii.geoterra.themes.GeoterraTheme

object PDFUtil {

  private val pdfManager: PDFManager = getKoin().get()

  private const val AUTHORITY = "ucr.ac.cr.inii.geoterra.provider"

  private suspend fun generatePdf(
    fileName: String,
    content: @Composable () -> Unit,
    shareAfterCreation: Boolean = false,
    authority:String=""
  ): String? = withContext(Dispatchers.Default) {
    val pdfPath = pdfManager.createPdfFromComposable(
			fileName,
			{
				GeoterraTheme(useDarkTheme = false) {
					Box(
						modifier = Modifier
							.padding(32.dp)
							.background(MaterialTheme.colorScheme.background)
					) {
						content()
					}
				}
			}
		)

    if (shareAfterCreation && pdfPath != null) {
      pdfManager.openPdf(pdfPath,authority)
    }

    return@withContext pdfPath
  }

  suspend fun generateRequestPdf(
    state: InvestigationRequestDetailsState,
    fileName: String
  ) : String? {
    return generatePdf(
      fileName = fileName,
      content = {
				InvestigationRequestDetailsContent(
					state = state,
					isForPdf = true
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
				GeomanifestationContent(
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