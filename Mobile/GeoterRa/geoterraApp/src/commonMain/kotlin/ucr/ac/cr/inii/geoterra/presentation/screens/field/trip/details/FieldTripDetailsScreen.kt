package ucr.ac.cr.inii.geoterra.presentation.screens.fieldtrip.details

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material.icons.filled.Share
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
import org.koin.core.parameter.parametersOf
import ucr.ac.cr.inii.geoterra.domain.pdf.PDFUtil
import ucr.ac.cr.inii.geoterra.presentation.components.common.AdaptiveBackButton
import ucr.ac.cr.inii.geoterra.presentation.components.common.CustomSnackbarHost
import ucr.ac.cr.inii.geoterra.presentation.components.common.LoadingDialog
import ucr.ac.cr.inii.geoterra.presentation.components.common.SnackbarType
import ucr.ac.cr.inii.geoterra.presentation.components.common.SuccessActionDialog
import ucr.ac.cr.inii.geoterra.presentation.components.common.TypedSnackbarHostState
import ucr.ac.cr.inii.geoterra.presentation.screens.field.trip.details.FieldTripDetailsViewModel
import ucr.ac.cr.inii.geoterra.presentation.screens.field.geomanifestation.details.GeomanifestationDetailsScreen
import ucr.ac.cr.inii.geoterra.presentation.screens.geomanifestation.form.GeomanifestationFormScreen

class FieldTripDetailsScreen(
	private val fieldTripId: String
) : Screen {
	override val key: ScreenKey = uniqueScreenKey

	@Composable
	override fun Content() {
		val viewModel = getScreenModel<FieldTripDetailsViewModel> { parametersOf(fieldTripId) }
		val state by viewModel.state.collectAsState()
		val snackbarHostState = remember { TypedSnackbarHostState() }
		val scope = rememberCoroutineScope()
		val navigator = LocalNavigator.currentOrThrow
		var isFabExpanded by remember { mutableStateOf(false) }

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
				message = "Renderizando documento de gira, por favor espere..."
			)
		}

		if (state.lastGeneratedPdfPath != null) {
			SuccessActionDialog(
				message = "El reporte PDF de la gira se ha generado correctamente.",
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
						text = "Detalles de la Gira",
						style = MaterialTheme.typography.headlineMedium,
						fontWeight = FontWeight.Bold,
						color = MaterialTheme.colorScheme.secondary,
						modifier = Modifier.weight(1f)
					)
					AdaptiveBackButton(onBack = { navigator.pop() })
				}
			},
			floatingActionButton = {
				Column(
					horizontalAlignment = Alignment.End,
					verticalArrangement = Arrangement.spacedBy(8.dp)
				) {
					AnimatedVisibility(
						visible = isFabExpanded,
						enter = fadeIn() + slideInVertically(initialOffsetY = { it / 2 }),
						exit = fadeOut() + slideOutVertically(targetOffsetY = { it / 2 })
					) {
						Column(
							horizontalAlignment = Alignment.End,
							verticalArrangement = Arrangement.spacedBy(8.dp)
						) {
							ExtendedFloatingActionButton(
								onClick = {
									isFabExpanded = false
									navigator.push(GeomanifestationFormScreen(fieldTripId = fieldTripId))
								},
								icon = { Icon(Icons.Default.Add, contentDescription = "Añadir Geomanifestación") },
								text = { Text("Añadir Manifestación") },
								containerColor = MaterialTheme.colorScheme.primaryContainer,
								contentColor = MaterialTheme.colorScheme.onPrimaryContainer
							)

							ExtendedFloatingActionButton(
								onClick = {
									isFabExpanded = false
									scope.launch {
										try {
											viewModel.setPdfGenerating(true)
//											val fieldTripName = state.fieldTrip?.field_trip_name ?: "Gira"
//											val fileName = "Reporte_Gira_$fieldTripName"
//											val resultPath = PDFUtil.generateRequestPdf(state, fileName)
//
//											if (resultPath != null) {
//												viewModel.setGeneratedPdfPath(resultPath)
//												viewModel.updateSnackBarMessage(
//													message = "PDF generado exitosamente.",
//													type = SnackbarType.SUCCESS
//												)
//											}
										} catch (e: Exception) {
											viewModel.updateSnackBarMessage(
												message = "Ha ocurrido un error al generar el PDF, por favor intenta de nuevo.",
												type = SnackbarType.ERROR
											)
											e.printStackTrace()
										} finally {
											viewModel.setPdfGenerating(false)
										}
									}
								},
								icon = { Icon(Icons.Default.Download, contentDescription = "Descargar PDF") },
								text = { Text("Descargar PDF") },
								containerColor = MaterialTheme.colorScheme.primaryContainer,
								contentColor = MaterialTheme.colorScheme.onPrimaryContainer
							)

							ExtendedFloatingActionButton(
								onClick = {
									isFabExpanded = false
									viewModel.updateSnackBarMessage(
										message = "Opción de compartir en desarrollo.",
										type = SnackbarType.INFO
									)
								},
								icon = { Icon(Icons.Default.Share, contentDescription = "Compartir") },
								text = { Text("Compartir Gira") },
								containerColor = MaterialTheme.colorScheme.primaryContainer,
								contentColor = MaterialTheme.colorScheme.onPrimaryContainer
							)
						}
					}

					FloatingActionButton(
						onClick = { isFabExpanded = !isFabExpanded },
						containerColor = MaterialTheme.colorScheme.primary,
						contentColor = MaterialTheme.colorScheme.onPrimary
					) {
						Icon(
							imageVector = if (isFabExpanded) Icons.Default.Close else Icons.Default.Menu,
							contentDescription = "Menú de acciones"
						)
					}
				}
			}
		) { paddingValues ->
			FieldTripDetailsContent(
				modifier = Modifier
					.padding(top = paddingValues.calculateTopPadding())
					.padding(horizontal = 20.dp),
				state = state,
				isForPdf = false,
				onGeomanifestationClick = { manifestationId ->
					navigator.push(GeomanifestationDetailsScreen(manifestationId = manifestationId))
				}
			)
		}
	}
}