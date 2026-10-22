package ucr.ac.cr.inii.geoterra.presentation.screens.fieldtrip.form

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
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
import org.koin.core.parameter.parametersOf
import ucr.ac.cr.inii.geoterra.data.model.responses.FieldTripResponse
import ucr.ac.cr.inii.geoterra.presentation.components.common.*

data class FieldTripFormScreen(
	val fieldTripToEdit: FieldTripResponse? = null
) : Screen {

	override val key: ScreenKey = uniqueScreenKey

	@Composable
	override fun Content() {
		val navigator = LocalNavigator.currentOrThrow
		val viewModel = getScreenModel<FieldTripFormViewModel>(
			parameters = { parametersOf(fieldTripToEdit) }
		)

		val state by viewModel.state.collectAsState()
		val snackbarHostState = remember { TypedSnackbarHostState() }

		LoadingDialog(isVisible = state.isLoading)

		LaunchedEffect(state.snackBarMessage) {
			state.snackBarMessage?.let { snackbarMsg ->
				snackbarHostState.showSnackbar(
					message = snackbarMsg.text,
					type = snackbarMsg.type
				)
				viewModel.onEvent(FieldTripFormEvent.ClearSnackBar)

				if (state.isSuccess) {
					viewModel.clearSuccess()
					navigator.pop()
				}
			}
		}

		Scaffold(
			snackbarHost = { CustomSnackbarHost(snackbarHostState) },
			modifier = Modifier.fillMaxSize(),
			containerColor = MaterialTheme.colorScheme.background,
			topBar = {
				Row(
					modifier = Modifier
						.fillMaxWidth()
						.padding(horizontal = 20.dp, vertical = 10.dp),
					verticalAlignment = Alignment.CenterVertically,
					horizontalArrangement = Arrangement.Start
				) {
					Text(
						text = if (fieldTripToEdit != null) "Editar Gira" else "Registrar Gira",
						style = MaterialTheme.typography.headlineMedium,
						fontWeight = FontWeight.Bold,
						color = MaterialTheme.colorScheme.secondary,
						modifier = Modifier.weight(1f)
					)
					AdaptiveBackButton(onBack = { navigator.pop() })
				}
			}
		) { paddingValues ->
			FieldTripFormContent(
				modifier = Modifier
					.padding(top = paddingValues.calculateTopPadding())
					.padding(horizontal = 20.dp),
				state = state,
				onEvent = viewModel::onEvent
			)
		}
	}
}
