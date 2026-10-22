package ucr.ac.cr.inii.geoterra.presentation.screens.fieldtrip

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
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material.icons.filled.Refresh
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
import ucr.ac.cr.inii.geoterra.presentation.components.common.CustomSnackbarHost
import ucr.ac.cr.inii.geoterra.presentation.components.common.TypedSnackbarHostState
import ucr.ac.cr.inii.geoterra.presentation.screens.fieldtrip.details.FieldTripDetailsScreen
import ucr.ac.cr.inii.geoterra.presentation.screens.fieldtrip.form.FieldTripFormScreen

class FieldTripScreen : Screen {
	override val key: ScreenKey = uniqueScreenKey

	@Composable
	override fun Content() {
		val viewModel = getScreenModel<FieldTripViewModel>()
		val state by viewModel.state.collectAsState()
		val navigator = LocalNavigator.currentOrThrow

		val snackbarHostState = remember { TypedSnackbarHostState() }
		var isFabExpanded by remember { mutableStateOf(false) }

		LaunchedEffect(Unit) {
			viewModel.fetchAllData()
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

		Scaffold(
			snackbarHost = { CustomSnackbarHost(snackbarHostState) },
			topBar = {
				Row(
					modifier = Modifier
						.fillMaxWidth()
						.padding(horizontal = 20.dp, vertical = 10.dp),
					verticalAlignment = Alignment.CenterVertically
				) {
					Text(
						text = "Giras de Campo",
						style = MaterialTheme.typography.headlineMedium,
						fontWeight = FontWeight.Bold,
						color = MaterialTheme.colorScheme.secondary
					)
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
									viewModel.fetchAllData()
								},
								icon = { Icon(Icons.Default.Refresh, contentDescription = "Actualizar") },
								text = { Text("Actualizar lista") },
								containerColor = MaterialTheme.colorScheme.secondaryContainer,
								contentColor = MaterialTheme.colorScheme.onSecondaryContainer
							)

							ExtendedFloatingActionButton(
								onClick = {
									isFabExpanded = false
									navigator.push(FieldTripFormScreen())
								},
								icon = { Icon(Icons.Default.Add, contentDescription = "Nueva Gira") },
								text = { Text("Registrar Gira") },
								containerColor = MaterialTheme.colorScheme.secondaryContainer,
								contentColor = MaterialTheme.colorScheme.onSecondaryContainer
							)
						}
					}

					FloatingActionButton(
						onClick = { isFabExpanded = !isFabExpanded },
						containerColor = MaterialTheme.colorScheme.secondary,
						contentColor = MaterialTheme.colorScheme.onSecondary
					) {
						Icon(
							imageVector = if (isFabExpanded) Icons.Default.Close else Icons.Default.Menu,
							contentDescription = "Menú de Giras"
						)
					}
				}
			}
		) { paddingValues ->
			FieldTripContent(
				modifier = Modifier
					.padding(top = paddingValues.calculateTopPadding())
					.padding(horizontal = 20.dp),
				state = state,
				onTabSelected = { tab -> viewModel.selectTab(tab) },
				onViewDetails = { fieldTrip ->
					navigator.push(
						FieldTripDetailsScreen(fieldTrip.field_trip_id)
					)
				}
			)
		}
	}
}