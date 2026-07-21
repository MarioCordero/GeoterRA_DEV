package ucr.ac.cr.inii.geoterra.presentation.screens.editProfile

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import cafe.adriel.voyager.core.screen.Screen
import cafe.adriel.voyager.core.screen.ScreenKey
import cafe.adriel.voyager.core.screen.uniqueScreenKey
import cafe.adriel.voyager.koin.getScreenModel
import cafe.adriel.voyager.navigator.LocalNavigator
import cafe.adriel.voyager.navigator.currentOrThrow
import org.koin.core.parameter.parametersOf
import ucr.ac.cr.inii.geoterra.data.model.responses.UserResponse
import ucr.ac.cr.inii.geoterra.presentation.components.common.AdaptiveBackButton
import ucr.ac.cr.inii.geoterra.presentation.components.common.CustomSnackbarHost
import ucr.ac.cr.inii.geoterra.presentation.components.common.LoadingDialog
import ucr.ac.cr.inii.geoterra.presentation.components.common.TypedSnackbarHostState

class EditProfileScreen(
	private val userProfile: UserResponse
) : Screen {
	override val key: ScreenKey = uniqueScreenKey

	@Composable
	override fun Content() {
		val navigator = LocalNavigator.currentOrThrow
		val viewModel = getScreenModel<EditProfileViewModel>(
			parameters = { parametersOf(userProfile) }
		)
		val state by viewModel.state.collectAsState()
		val snackBarState = remember { TypedSnackbarHostState() }

		// --- Dialogs ---
		if (state.isLoading) {
			LoadingDialog(isVisible = true, message = "Actualizando cuenta...")
		}

		LaunchedEffect(state.isSuccess) {
			if (state.isSuccess) {
				state.snackBarMessage?.let { message ->
					snackBarState.showSnackbar(message.text, message.type)
					viewModel.onSnackbarDismissed()
					navigator.pop()
				}
			}
		}

		LaunchedEffect(state.snackBarMessage) {
			state.snackBarMessage?.let { message ->
				snackBarState.showSnackbar(message.text, message.type)
				viewModel.onSnackbarDismissed()
			}
		}

		Scaffold(
			snackbarHost = { CustomSnackbarHost(hostState = snackBarState) },
			topBar = {
				Row(
					modifier = Modifier
						.fillMaxWidth()
						.padding(horizontal = 20.dp, vertical = 10.dp),
					verticalAlignment = Alignment.CenterVertically,
					horizontalArrangement = Arrangement.End
				) {
					AdaptiveBackButton(onBack = { navigator.pop() })
				}
			}
		) { padding ->
			EditProfileContent(
				modifier = Modifier.padding(top = padding.calculateTopPadding()),
				state = state,
				onEvent = viewModel
			)
		}
	}
}