package ucr.ac.cr.inii.geoterra.presentation.screens.investigation.requests.details

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Download
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import cafe.adriel.voyager.core.screen.Screen
import cafe.adriel.voyager.navigator.LocalNavigator
import cafe.adriel.voyager.navigator.currentOrThrow
import kotlinx.coroutines.launch
import ucr.ac.cr.inii.geoterra.data.model.responses.InvestigationRequestResponse
import ucr.ac.cr.inii.geoterra.domain.pdf.PDFUtil
import ucr.ac.cr.inii.geoterra.presentation.components.common.AdaptiveBackButton
import ucr.ac.cr.inii.geoterra.presentation.components.common.CustomSnackbarHost
import ucr.ac.cr.inii.geoterra.presentation.components.common.LoadingDialog
import ucr.ac.cr.inii.geoterra.presentation.components.common.SnackbarType
import ucr.ac.cr.inii.geoterra.presentation.components.common.SuccessActionDialog
import ucr.ac.cr.inii.geoterra.presentation.components.common.TypedSnackbarHostState

class InvestigationRequestDetailsScreen(
	private val request: InvestigationRequestResponse
) : Screen {

	@OptIn(ExperimentalMaterial3Api::class)
	@Composable
	override fun Content() {
		val navigator = LocalNavigator.currentOrThrow
		val scope = rememberCoroutineScope()

		// Manejo de estado local para la generación del PDF en esta pantalla
		var isPdfGenerating by remember { mutableStateOf(false) }
		var lastGeneratedPdfPath by remember { mutableStateOf<String?>(null) }
		val snackbarHostState = remember { TypedSnackbarHostState() }

		if (isPdfGenerating) {
			LoadingDialog(
				isVisible = isPdfGenerating,
				message = "Renderizando documento, por favor espere..."
			)
		}

		if (lastGeneratedPdfPath != null) {
			SuccessActionDialog(
				message = "El reporte PDF se ha generado correctamente.",
				confirmText = "Abrir PDF",
				dismissText = "Ahora no",
				onConfirm = {
					lastGeneratedPdfPath?.let { path ->
						PDFUtil.openPdf(path, "ucr.ac.cr.inii.geoterra.provider")
					}
					lastGeneratedPdfPath = null
				},
				onDismiss = { lastGeneratedPdfPath = null }
			)
		}

		Scaffold(
			snackbarHost = { CustomSnackbarHost(snackbarHostState) },
			topBar = {
				Row(
					modifier = Modifier
						.fillMaxWidth()
						.padding(horizontal = 20.dp, vertical = 10.dp),
					verticalAlignment = Alignment.CenterVertically,
					horizontalArrangement = Arrangement.Start
				) {
					Text(
						text = "Detalles de la Solicitud",
						style = MaterialTheme.typography.headlineMedium,
						fontWeight = FontWeight.Bold,
						color = MaterialTheme.colorScheme.secondary,
						modifier = Modifier.weight(1f)
					)
					AdaptiveBackButton(onBack = { navigator.pop() })
				}
			},
			floatingActionButton = {
				ExtendedFloatingActionButton(
					onClick = {
						scope.launch {
							try {
								isPdfGenerating = true
								val fileName = "Reporte_Solicitud_${request.request_name}"
								val resultPath = PDFUtil.generateRequestPdf(request, fileName)

								if (resultPath != null) {
									lastGeneratedPdfPath = resultPath
								}
							} catch (e: Exception) {
								snackbarHostState.showSnackbar(
									message = "Ha ocurrido un error al generar el PDF, por favor intenta de nuevo.",
									type = SnackbarType.ERROR
								)
								e.printStackTrace()
							} finally {
								isPdfGenerating = false
							}
						}
					},
					icon = { Icon(Icons.Default.Download, contentDescription = "Descargar PDF") },
					text = { Text("Descargar PDF") },
					containerColor = MaterialTheme.colorScheme.primary,
					contentColor = MaterialTheme.colorScheme.onPrimary
				)
			}
		) { paddingValues ->
			Box(modifier = Modifier.padding(paddingValues).padding(horizontal = 20.dp)) {
				RequestDetailsContent(request = request, isForPdf = false)
			}
		}
	}
}