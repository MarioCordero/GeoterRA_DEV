package ucr.ac.cr.inii.geoterra.presentation.screens.sign.`in`

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import cafe.adriel.voyager.core.screen.Screen
import cafe.adriel.voyager.core.screen.ScreenKey
import cafe.adriel.voyager.core.screen.uniqueScreenKey
import cafe.adriel.voyager.koin.getScreenModel
import cafe.adriel.voyager.navigator.LocalNavigator
import cafe.adriel.voyager.navigator.currentOrThrow
import ucr.ac.cr.inii.geoterra.presentation.components.common.CustomSnackbarHost
import ucr.ac.cr.inii.geoterra.presentation.components.common.TypedSnackbarHostState
import ucr.ac.cr.inii.geoterra.presentation.screens.sign.SignUpScreen

/**
 * Voyager Screen for the Login screen.
 */
class SignInScreen : Screen {

	override val key: ScreenKey = uniqueScreenKey

	@Composable
	override fun Content() {
		val viewModel = getScreenModel<SignInViewModel>()
		val state by viewModel.state.collectAsState()
		val navigator = LocalNavigator.currentOrThrow

		val snackbarHostState = remember { TypedSnackbarHostState() }

		LaunchedEffect(state.snackBarMessage) {
			state.snackBarMessage?.let { snackbarMsg ->
				snackbarHostState.showSnackbar(
					message = snackbarMsg.text,
					type = snackbarMsg.type
				)
				viewModel.onSnackBarDismissed()
			}
		}

		Scaffold(
			modifier = Modifier.fillMaxSize(),
			containerColor = Color.Transparent,
			snackbarHost = { CustomSnackbarHost(snackbarHostState) }
		) {
			SignInContent(
				modifier = Modifier,
				state = state,
				onEmailChanged = viewModel::onEmailChanged,
				onPasswordChanged = viewModel::onPasswordChanged,
				onLoginClick = viewModel::login,
				onRegisterClick = { navigator.push(SignUpScreen()) },
				onTogglePassword = viewModel::togglePasswordVisibility,
			)
		}
	}
}