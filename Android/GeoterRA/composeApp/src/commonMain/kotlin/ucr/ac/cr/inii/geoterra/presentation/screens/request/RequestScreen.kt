package ucr.ac.cr.inii.geoterra.presentation.screens.request

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.padding
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
import io.github.vinceglb.filekit.PlatformFile
import io.github.vinceglb.filekit.dialogs.compose.rememberFileSaverLauncher
import io.github.vinceglb.filekit.write
import kotlinx.coroutines.launch
import ucr.ac.cr.inii.geoterra.data.model.remote.AnalysisRequestRemote
import ucr.ac.cr.inii.geoterra.presentation.components.analysisform.RequestDetailSheet
import ucr.ac.cr.inii.geoterra.presentation.screens.analysisform.AnalysisFormScreen
import ucr.ac.cr.inii.geoterra.presentation.utils.pdf.PdfGenerator

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
    var bytesToWrite by remember { mutableStateOf<ByteArray?>(null) }

    val saverLauncher = rememberFileSaverLauncher { file ->
      if (file != null && bytesToWrite != null) {
        scope.launch {
          file.write(bytesToWrite!!)
          bytesToWrite = null
          snackbarHostState.showSnackbar("Archivo guardado con éxito")
        }
      }
    }

    LaunchedEffect(Unit) {
      viewModel.fetchSubmittedRequests()
    }

    LaunchedEffect(state.snackBarMessage) {
      state.snackBarMessage?.let {
        snackbarHostState.showSnackbar(it)
        viewModel.dismissSnackBar()
      }
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
                val pdfBytes = PdfGenerator.generateFromComposable(
                  request = req,
                  fileName = "Reporte_${req.name}"
                )
                if (pdfBytes != null) {
                  bytesToWrite = pdfBytes // 1. Guardamos los bytes en memoria
//                  saverLauncher.launch(
//                    suggestedName = "Reporte_${req.name.replace(" ", "_")}",
//                    extension = "pdf",
//                    directory = null,
//                  )
                }
              } catch (e: Exception) {
                e.printStackTrace()
                snackbarHostState.showSnackbar("Falló la generación: ${e.message}")
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
    ) { padding ->
      RequestsContent(
        modifier = Modifier.padding(padding),
        state = state,
        onView = { req -> selectedRequest = req },
        onEdit = { req -> navigator.push(AnalysisFormScreen(req)) },
        onDelete = { req -> viewModel.deleteRequest(req.id) },
      )
    }
  }
}