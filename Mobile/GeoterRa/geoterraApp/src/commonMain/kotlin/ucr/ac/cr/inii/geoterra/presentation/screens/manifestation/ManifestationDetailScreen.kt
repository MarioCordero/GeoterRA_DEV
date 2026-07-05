package ucr.ac.cr.inii.geoterra.presentation.screens.manifestation

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import cafe.adriel.voyager.core.screen.Screen
import cafe.adriel.voyager.core.screen.ScreenKey
import cafe.adriel.voyager.core.screen.uniqueScreenKey
import cafe.adriel.voyager.koin.getScreenModel
import cafe.adriel.voyager.navigator.LocalNavigator
import cafe.adriel.voyager.navigator.currentOrThrow
import kotlinx.coroutines.launch
import org.koin.compose.koinInject
import org.koin.core.parameter.parametersOf
import org.koin.core.qualifier.Qualifier
import ucr.ac.cr.inii.geoterra.data.model.remote.ManifestationRemote
import ucr.ac.cr.inii.geoterra.domain.pdf.PDFUtil
import ucr.ac.cr.inii.geoterra.presentation.components.layout.AdaptiveBackButton
import ucr.ac.cr.inii.geoterra.presentation.components.layout.ConfirmDialog
import ucr.ac.cr.inii.geoterra.presentation.components.layout.LoadingDialog
import ucr.ac.cr.inii.geoterra.presentation.components.layout.StatusDialog
import ucr.ac.cr.inii.geoterra.presentation.components.layout.SuccessActionDialog
import ucr.ac.cr.inii.geoterra.presentation.screens.analysisform.AnalysisFormViewModel
import ucr.ac.cr.inii.geoterra.presentation.screens.map.MapViewModel

class ManifestationDetailScreen(val manifestation: ManifestationRemote) : Screen {
  override val key: ScreenKey = uniqueScreenKey

  @OptIn(ExperimentalMaterial3Api::class)
  @Composable
  override fun Content() {
    val viewModel = getScreenModel<ManifestationDetailViewModel>(
      parameters = { parametersOf(manifestation) }
    )
    val state by viewModel.state.collectAsState()
    val navigator = LocalNavigator.currentOrThrow

    // Loading Dialog
    if (state.isPdfGenerating) {
      LoadingDialog(
        isVisible = state.isPdfGenerating,
        message = "Renderizando documento, por favor espere..."
      )
    }

    // Success Dialog
    if (state.lastGeneratedPdfPath != null) {
      SuccessActionDialog(
        message = "El reporte PDF se ha generado correctamente.",
        confirmText = "Abrir PDF",
        dismissText = "Ahora no",
        onConfirm = {
          state.lastGeneratedPdfPath?.let { path ->
            PDFUtil.openPdf(path, "ucr.ac.cr.inii.geoterra.provider")
          }
          viewModel.clearPdfStatus()
        },
        onDismiss = { viewModel.clearPdfStatus() }
      )
    }

    // Error Dialog
    if (state.pdfError != null) {
      StatusDialog(
        isSuccess = false,
        message = state.pdfError!!,
        onDismiss = { viewModel.clearPdfError() }
      )
    }

    ManifestationDetailContent(
      modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp),
      state = state,
      manifestation = state.manifestation!!,
      onDownload = {
        viewModel.downloadReport()
      },
      onBack = navigator::pop
    )
  }
}