package ucr.ac.cr.inii.geoterra.presentation.screens.request

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import cafe.adriel.voyager.core.screen.Screen
import cafe.adriel.voyager.koin.getScreenModel
import cafe.adriel.voyager.navigator.LocalNavigator
import cafe.adriel.voyager.navigator.currentOrThrow
import kotlinx.coroutines.launch
import org.koin.mp.KoinPlatform.getKoin
import ucr.ac.cr.inii.geoterra.data.model.remote.AnalysisRequestRemote
import ucr.ac.cr.inii.geoterra.domain.pdf.PDFManager
import ucr.ac.cr.inii.geoterra.domain.pdf.PDFUtil
import ucr.ac.cr.inii.geoterra.presentation.components.analysisform.RequestDetailSheet
import ucr.ac.cr.inii.geoterra.presentation.components.layout.ConfirmDialog
import ucr.ac.cr.inii.geoterra.presentation.components.layout.LoadingDialog
import ucr.ac.cr.inii.geoterra.presentation.components.layout.StatusDialog
import ucr.ac.cr.inii.geoterra.presentation.components.layout.SuccessActionDialog
import ucr.ac.cr.inii.geoterra.presentation.screens.analysisform.AnalysisFormScreen

class RequestsScreen : Screen {
  @OptIn(ExperimentalMaterial3Api::class)
  @Composable
  override fun Content() {
    val viewModel = getScreenModel<RequestViewModel>()
    val state by viewModel.state.collectAsState()
    val navigator = LocalNavigator.currentOrThrow

    val snackbarHostState = remember { SnackbarHostState() }
    var selectedRequest by remember { mutableStateOf<AnalysisRequestRemote?>(null) }
    val sheetState = rememberModalBottomSheetState()
    val scope = rememberCoroutineScope()

    LaunchedEffect(Unit) {
      viewModel.fetchSubmittedRequests()
    }

    LaunchedEffect(state.snackBarMessage) {
      state.snackBarMessage?.let {
        snackbarHostState.showSnackbar(it)
        viewModel.dismissSnackBar()
      }
    }

    // --- UI FEEDBACK DIALOGS ---

    // Loading Dialog
    if (state.isPdfGenerating) {
      LoadingDialog(
        isVisible = state.isPdfGenerating,
        message = "Renderizando documento, por favor espere..."
      )
    }

    state.requestToDelete?.let { request ->
      ConfirmDialog(
        title = "Eliminar solicitud",
        message = "¿Estás seguro de que deseas eliminar esta solicitud? Esta acción no se puede deshacer.",
        confirmText = "Eliminar",
        onConfirm = { viewModel.deleteRequest(request.id) },
        onDismiss = { viewModel.setRequestToDelete(null) },
        isDanger = true
      )
    }

    // 2. SuccessActionDialog para éxito
    if (state.showSuccessDialog) {
      SuccessActionDialog(
        title = "¡Borrado exitoso!",
        message = "La solicitud ha sido eliminada correctamente de tu lista.",
        onConfirm = { viewModel.clearSuccessDialog() },
        onDismiss = { viewModel.clearSuccessDialog() }
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

    selectedRequest?.let { request ->
      ModalBottomSheet(
        onDismissRequest = { selectedRequest = null },
        sheetState = sheetState,
        containerColor = MaterialTheme.colorScheme.background,
        shape = RoundedCornerShape(topStart = 32.dp, topEnd = 32.dp),
      ) {
        RequestDetailSheet(
          request = request,
          onDownloadPdf = { req ->
            scope.launch {
              try {
                viewModel.setPdfGenerating(true)
                val fileName = "Reporte_Solicitud_${req.name}"

                // Call the generator and capture the path
                val resultPath = PDFUtil.generateRequestPdf(req, fileName)

                if (resultPath != null) {
                  viewModel.setGeneratedPdfPath(resultPath)
                  selectedRequest = null // Close the bottom sheet on success
                }
              } catch (e: Exception) {
                viewModel.setPdfError("Error al generar PDF: ${e.message}")
                e.printStackTrace()
              } finally {
                viewModel.setPdfGenerating(false)
              }
            }
          }
        )
      }
    }

    Scaffold(
      snackbarHost = { SnackbarHost(snackbarHostState) },
      floatingActionButton = {
        FloatingActionButton(
          onClick = { navigator.push(AnalysisFormScreen()) },
          containerColor = MaterialTheme.colorScheme.primary,
          contentColor = MaterialTheme.colorScheme.onPrimary
        ) {
          Icon(Icons.Default.Add, contentDescription = "Crear")
        }
      },
      topBar = {
        Column(modifier = Modifier.padding(horizontal = 12.dp, vertical = 12.dp)) {
          Text(
            text = "Solicitudes",
            style = MaterialTheme.typography.headlineMedium,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.secondary
          )
        }
      }
    ) { paddingValues ->
      RequestsContent(
        modifier = Modifier.padding(top = paddingValues.calculateTopPadding()),
        state = state,
        onView = { req -> selectedRequest = req },
        onEdit = { req -> navigator.push(AnalysisFormScreen(requestToEdit = req)) },
        onDelete = { req -> viewModel.setRequestToDelete(req) }
      )
    }
  }
}