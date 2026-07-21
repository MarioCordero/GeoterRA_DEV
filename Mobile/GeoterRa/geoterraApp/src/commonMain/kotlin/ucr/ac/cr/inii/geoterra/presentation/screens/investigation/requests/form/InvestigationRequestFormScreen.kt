package ucr.ac.cr.inii.geoterra.presentation.screens.investigation.requests.form

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import cafe.adriel.voyager.core.screen.Screen
import cafe.adriel.voyager.navigator.LocalNavigator
import cafe.adriel.voyager.navigator.currentOrThrow
import ucr.ac.cr.inii.geoterra.data.model.responses.InvestigationRequestResponse
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import cafe.adriel.voyager.core.screen.ScreenKey
import cafe.adriel.voyager.core.screen.uniqueScreenKey
import cafe.adriel.voyager.koin.getScreenModel
import org.koin.core.parameter.parametersOf
import ucr.ac.cr.inii.geoterra.presentation.components.common.AdaptiveBackButton
import ucr.ac.cr.inii.geoterra.presentation.components.common.CustomSnackbarHost
import ucr.ac.cr.inii.geoterra.presentation.components.common.LoadingDialog
import ucr.ac.cr.inii.geoterra.presentation.components.common.TypedSnackbarHostState

data class InvestigationRequestFormScreen(
	val requestToEdit: InvestigationRequestResponse? = null
) : Screen {

	override val key: ScreenKey = uniqueScreenKey

	@Composable
	override fun Content() {
		val navigator = LocalNavigator.currentOrThrow
		val viewModel = getScreenModel<InvestigationRequestFormViewModel>(
			parameters = { parametersOf(requestToEdit) }
		)

		val state by viewModel.state.collectAsState()
		val snackbarHostState = remember { TypedSnackbarHostState() }

		LoadingDialog(
			isVisible = state.isLoading,
		)

		LaunchedEffect(state.snackBarMessage) {
			state.snackBarMessage?.let { snackbarMsg ->
				snackbarHostState.showSnackbar(
					message = snackbarMsg.text,
					type = snackbarMsg.type
				)

				viewModel.onEvent(AnalysisFormEvent.ClearSnackBar)

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
						text = if (requestToEdit != null) "Editar Solicitud" else "Nueva Solicitud",
						style = MaterialTheme.typography.headlineMedium,
						fontWeight = FontWeight.Bold,
						color = MaterialTheme.colorScheme.secondary,
						modifier = Modifier.weight(1f)
					)
					AdaptiveBackButton(onBack = { navigator.pop() })
				}
			}
		) { paddingValues ->
			InvestigationRequestFormContent(
				modifier = Modifier.padding(top = paddingValues.calculateTopPadding()),
				state = state,
				onEvent = viewModel::onEvent,
			)
		}
	}
}