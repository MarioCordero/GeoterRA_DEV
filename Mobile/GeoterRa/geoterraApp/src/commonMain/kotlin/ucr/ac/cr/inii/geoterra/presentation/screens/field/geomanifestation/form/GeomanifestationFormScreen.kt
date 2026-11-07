package ucr.ac.cr.inii.geoterra.presentation.screens.geomanifestation.form

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
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
import ucr.ac.cr.inii.geoterra.presentation.components.common.*

data class GeomanifestationFormScreen(
	val fieldTripId: String,
	val manifestationToEdit: GeomanifestationResponse? = null
) : Screen {

	override val key: ScreenKey = uniqueScreenKey

	@Composable
	override fun Content() {
		val navigator = LocalNavigator.currentOrThrow
		val viewModel = getScreenModel<GeomanifestationFormViewModel>(
			parameters = { parametersOf(fieldTripId, manifestationToEdit) }
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
				viewModel.onEvent(GeomanifestationFormEvent.ClearSnackBar)

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
						text = if (manifestationToEdit != null) "Editar Manifestación" else "Registrar Manifestación",
						style = MaterialTheme.typography.headlineMedium,
						fontWeight = FontWeight.Bold,
						color = MaterialTheme.colorScheme.secondary,
						modifier = Modifier.weight(1f)
					)
					AdaptiveBackButton(onBack = { navigator.pop() })
				}
			}
		) { paddingValues ->
			GeomanifestationFormContent(
				modifier = Modifier
					.padding(top = paddingValues.calculateTopPadding())
					.padding(horizontal = 20.dp),
				state = state,
				onEvent = viewModel::onEvent
			)
		}
	}
}