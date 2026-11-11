package ucr.ac.cr.inii.geoterra.presentation.screens.field.geomanifestation.details

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
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
import org.koin.core.parameter.parametersOf
import ucr.ac.cr.inii.geoterra.presentation.components.common.AdaptiveBackButton
import ucr.ac.cr.inii.geoterra.presentation.components.common.ConfirmDialog
import ucr.ac.cr.inii.geoterra.presentation.components.common.CustomSnackbarHost
import ucr.ac.cr.inii.geoterra.presentation.components.common.LoadingDialog
import ucr.ac.cr.inii.geoterra.presentation.components.common.TypedSnackbarHostState
import ucr.ac.cr.inii.geoterra.presentation.screens.field.insitu.form.InSituFormScreen

class GeomanifestationDetailsScreen(
	private val manifestationId: String
) : Screen {
	override val key: ScreenKey = uniqueScreenKey

	@Composable
	override fun Content() {
		val viewModel = getScreenModel<GeomanifestationDetailsViewModel> { parametersOf(manifestationId) }
		val state by viewModel.state.collectAsState()
		val snackbarHostState = remember { TypedSnackbarHostState() }
		val navigator = LocalNavigator.currentOrThrow

		LaunchedEffect(Unit) {
			viewModel.fetchDetails()
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

		state.testToDelete?.let { test ->
			ConfirmDialog(
				title = "Eliminar prueba de campo",
				message = "¿Estás seguro de que deseas eliminar esta prueba de campo? Esta acción no se puede deshacer.",
				confirmText = "Eliminar",
				onConfirm = { viewModel.deleteTest(test.insitu_test_id) },
				onDismiss = { viewModel.setTestToDelete(null) },
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
						text = "Detalles de Geomanifestación",
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
						navigator.push(
							InSituFormScreen(
								geomanifestationId = manifestationId,
								geomanifestationName = state.geomanifestation?.geomanifestation_name ?: "",
								onSuccess = { viewModel.fetchDetails() }
							)
						)
					},
					icon = {
						Icon(
							imageVector = Icons.Default.Add,
							contentDescription = "Agregar Prueba de Campo"
						)
					},
					text = { Text("Nueva Prueba de Campo") },
					containerColor = MaterialTheme.colorScheme.primary,
					contentColor = MaterialTheme.colorScheme.onPrimary
				)
			}
		) { paddingValues ->
			GeomanifestationDetailsContent(
				modifier = Modifier
					.padding(top = paddingValues.calculateTopPadding())
					.padding(horizontal = 20.dp),
				state = state,
				onEditTestClick = { test ->
					navigator.push(
						InSituFormScreen(
							geomanifestationId = manifestationId,
							geomanifestationName = state.geomanifestation?.geomanifestation_name ?: "",
							testToEdit = test,
							onSuccess = { viewModel.fetchDetails() }
						)
					)
				},
				onDeleteTestClick = { test ->
					viewModel.setTestToDelete(test)
				}
			)
		}
	}
}