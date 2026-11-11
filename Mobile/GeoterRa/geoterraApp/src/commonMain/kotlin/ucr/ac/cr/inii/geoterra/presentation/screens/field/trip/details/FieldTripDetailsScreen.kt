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
import org.koin.core.parameter.parametersOf
import ucr.ac.cr.inii.geoterra.data.model.responses.GeomanifestationResponse
import ucr.ac.cr.inii.geoterra.domain.pdf.PDFUtil
import ucr.ac.cr.inii.geoterra.presentation.components.common.AdaptiveBackButton
import ucr.ac.cr.inii.geoterra.presentation.components.common.ConfirmDialog
import ucr.ac.cr.inii.geoterra.presentation.components.common.CustomSnackbarHost
import ucr.ac.cr.inii.geoterra.presentation.components.common.LoadingDialog
import ucr.ac.cr.inii.geoterra.presentation.components.common.SnackbarType
import ucr.ac.cr.inii.geoterra.presentation.components.common.SuccessActionDialog
import ucr.ac.cr.inii.geoterra.presentation.components.common.TypedSnackbarHostState
import ucr.ac.cr.inii.geoterra.presentation.screens.field.geomanifestation.details.GeomanifestationDetailsScreen
import ucr.ac.cr.inii.geoterra.presentation.screens.field.trip.details.FieldTripDetailsViewModel
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
		val navigator = LocalNavigator.currentOrThrow
		var isFabExpanded by remember { mutableStateOf(false) }
		var manifestationToDelete by remember { mutableStateOf<GeomanifestationResponse?>(null) }

		LaunchedEffect(Unit) {
			viewModel.fetchFieldTripDetails()
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

		manifestationToDelete?.let { manifestation ->
			ConfirmDialog(
				title = "Eliminar Geomanifestación",
				message = "¿Estás seguro de que deseas desvincular la manifestación '${manifestation.geomanifestation_name}' de esta gira?",
				confirmText = "Eliminar",
				onConfirm = {
					viewModel.deleteGeomanifestation(manifestation.geomanifestation_id)
					manifestationToDelete = null
				},
				onDismiss = { manifestationToDelete = null },
				isDanger = true
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
									navigator.push(
										GeomanifestationFormScreen(
											fieldTripId = fieldTripId,
											fieldTripName = state.fieldTrip?.field_trip_name ?: "",
											onSuccess = { viewModel.fetchFieldTripDetails() }
										)
									)
								},
								icon = { Icon(Icons.Default.Add, contentDescription = "Añadir Geomanifestación") },
								text = { Text("Añadir Geomanifestación") },
								containerColor = MaterialTheme.colorScheme.primaryContainer,
								contentColor = MaterialTheme.colorScheme.onPrimaryContainer
							)

							ExtendedFloatingActionButton(
								onClick = {
									isFabExpanded = false
									viewModel.updateSnackBarMessage(
										message = "Opción de generar PDF en desarrollo.",
										type = SnackbarType.INFO
									)
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
				},
				onGeomanifestationEdit = { manifestation ->
					navigator.push(
						GeomanifestationFormScreen(
							fieldTripId = fieldTripId,
							fieldTripName = state.fieldTrip?.field_trip_name ?: "",
							manifestationToEdit = manifestation,
							onSuccess = { viewModel.fetchFieldTripDetails() }
						)
					)
				},
				onGeomanifestationDelete = { manifestation ->
					manifestationToDelete = manifestation
				}
			)
		}
	}
}