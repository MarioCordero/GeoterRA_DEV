package ucr.ac.cr.inii.geoterra.presentation.screens.investigation.requests

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
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
import ucr.ac.cr.inii.geoterra.data.model.responses.InvestigationRequestResponse
import ucr.ac.cr.inii.geoterra.domain.pdf.PDFUtil
import ucr.ac.cr.inii.geoterra.presentation.components.request.RequestBottomModalContent
import ucr.ac.cr.inii.geoterra.presentation.components.common.ConfirmDialog
import ucr.ac.cr.inii.geoterra.presentation.components.common.CustomSnackbarHost
import ucr.ac.cr.inii.geoterra.presentation.components.common.LoadingDialog
import ucr.ac.cr.inii.geoterra.presentation.components.common.SuccessActionDialog
import ucr.ac.cr.inii.geoterra.presentation.components.common.TypedSnackbarHostState
import ucr.ac.cr.inii.geoterra.presentation.components.common.SnackbarType
import ucr.ac.cr.inii.geoterra.presentation.screens.investigation.requests.form.InvestigationRequestFormScreen

class InvestigationRequestsScreen : Screen {
	override val key: ScreenKey = uniqueScreenKey

	@OptIn(ExperimentalMaterial3Api::class)
	@Composable
	override fun Content() {
		val viewModel = getScreenModel<InvestigationRequestsViewModel>()
		val state by viewModel.state.collectAsState()
		val navigator = LocalNavigator.currentOrThrow

		val snackbarHostState = remember { TypedSnackbarHostState() }
		var selectedRequest by remember { mutableStateOf<InvestigationRequestResponse?>(null) }
		val sheetState = rememberModalBottomSheetState()
		val scope = rememberCoroutineScope()

		LaunchedEffect(Unit) {
			viewModel.fetchSubmittedRequests()
		}

		LaunchedEffect(state.snackBarMessage) {
			state.snackBarMessage?.let { snackbarMsg ->
				snackbarHostState.showSnackbar(
					message = snackbarMsg.text,
					type = snackbarMsg.type
				)
				viewModel.clearSnackBarMessage()
			}
		}

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
				onConfirm = { viewModel.deleteRequest(request.request_id) },
				onDismiss = { viewModel.setRequestToDelete(null) },
				isDanger = true
			)
		}

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

		selectedRequest?.let { request ->
			ModalBottomSheet(
				onDismissRequest = { selectedRequest = null },
				sheetState = sheetState,
				containerColor = MaterialTheme.colorScheme.background,
				shape = RoundedCornerShape(topStart = 32.dp, topEnd = 32.dp),
			) {
				RequestBottomModalContent(
					request = request,
					onDownloadPdf = { req ->
						scope.launch {
							try {
								viewModel.setPdfGenerating(true)
								val fileName = "Reporte_Solicitud_${req.request_name}"

								val resultPath = PDFUtil.generateRequestPdf(req, fileName)

								if (resultPath != null) {
									viewModel.setGeneratedPdfPath(resultPath)
									selectedRequest = null
								}
							} catch (e: Exception) {
								viewModel.updateSnackBarMessage(
									"Ha ocurrido un error al generar el PDF, por favor intenta de nuevo.",
									SnackbarType.ERROR
								)
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
			snackbarHost = { CustomSnackbarHost(snackbarHostState) },
			floatingActionButton = {
				FloatingActionButton(
					onClick = {
						if (state.isLoggedIn) {
							navigator.push(InvestigationRequestFormScreen())
						} else {
							viewModel.updateSnackBarMessage(
								"Esta acción requiere que inicie sesión.",
								SnackbarType.INFO
							)
						}
					},
					containerColor = MaterialTheme.colorScheme.primary,
					contentColor = MaterialTheme.colorScheme.onPrimary
				) {
					Icon(Icons.Default.Add, contentDescription = "Crear")
				}
			},
			topBar = {
				Row(
					modifier = Modifier
						.fillMaxWidth()
						.padding(horizontal = 20.dp, vertical = 10.dp),
					verticalAlignment = Alignment.CenterVertically,
					horizontalArrangement = Arrangement.Start
				) {
					Text(
						text = "Solicitudes",
						style = MaterialTheme.typography.headlineMedium,
						fontWeight = FontWeight.Bold,
						color = MaterialTheme.colorScheme.secondary
					)
				}
			}
		) { paddingValues ->
			InvestigationRequestsContent(
				modifier = Modifier.padding(top = paddingValues.calculateTopPadding()),
				state = state,
				onView = { req -> selectedRequest = req },
				onEdit = { req -> navigator.push(InvestigationRequestFormScreen(requestToEdit = req)) },
				onDelete = { req -> viewModel.setRequestToDelete(req) }
			)
		}
	}
}