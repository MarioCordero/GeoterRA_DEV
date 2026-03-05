package ucr.ac.cr.inii.geoterra.presentation.utils.pdf

import com.daanidev.kmp_pdf_converter.pdf.PDFUtil
import io.ktor.utils.io.core.toByteArray
import ucr.ac.cr.inii.geoterra.data.model.remote.AnalysisRequestRemote
import ucr.ac.cr.inii.geoterra.presentation.components.analysisform.RequestDetailSheet

object PdfGenerator {

  suspend fun generateFromComposable(
    request: AnalysisRequestRemote,
    fileName: String
  ): ByteArray? {
    return PDFUtil.generatePdf(
      fileName = fileName,
      content = {
        RequestDetailSheet(
          request = request,
          isForPdf = true,
          onDownloadPdf = {}
        )
      },
      shareAfterCreation = false
    )?.toByteArray()
  }
}