package ucr.ac.cr.inii.geoterra.presentation.screens.account.password.recovery

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import cafe.adriel.voyager.core.screen.Screen
import cafe.adriel.voyager.core.screen.ScreenKey
import cafe.adriel.voyager.core.screen.uniqueScreenKey
import cafe.adriel.voyager.koin.getScreenModel
import cafe.adriel.voyager.navigator.LocalNavigator
import cafe.adriel.voyager.navigator.currentOrThrow
import kotlinx.coroutines.delay
import ucr.ac.cr.inii.geoterra.presentation.components.common.AdaptiveBackButton
import ucr.ac.cr.inii.geoterra.presentation.components.common.CustomSnackbarHost
import ucr.ac.cr.inii.geoterra.presentation.components.common.TypedSnackbarHostState

/**
 * Voyager Screen representing the password recovery flow.
 */
class PasswordRecoveryScreen : Screen {

	override val key: ScreenKey = uniqueScreenKey

	@Composable
	override fun Content() {
		val viewModel = getScreenModel<PasswordRecoveryViewModel>()
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

		LaunchedEffect(state.isSuccess) {
			if (state.isSuccess) {
				delay(1500)
				navigator.pop()
			}
		}

		Scaffold(
			modifier = Modifier.fillMaxSize(),
			containerColor = Color.Transparent,
			snackbarHost = { CustomSnackbarHost(snackbarHostState) },
			topBar = {
				Row(
					modifier = Modifier
						.fillMaxWidth()
						.padding(horizontal = 20.dp, vertical = 10.dp),
					verticalAlignment = Alignment.CenterVertically,
					horizontalArrangement = Arrangement.End
				) {

					Text(
						text = "Recuperar Contraseña",
						style = MaterialTheme.typography.headlineMedium,
						fontWeight = FontWeight.Bold,
						color = MaterialTheme.colorScheme.secondary,
						modifier = Modifier.weight(1f)
					)

					AdaptiveBackButton(onBack = { navigator.pop() })
				}
			}
		) {
			PasswordRecoveryContent(
				modifier = Modifier
					.padding(top = it.calculateTopPadding())
					.padding(horizontal = 20.dp),
				state = state,
				onEmailChanged = viewModel::onEmailChanged,
				onTokenChanged = viewModel::onTokenChanged,
				onPasswordChanged = viewModel::onPasswordChanged,
				onConfirmPasswordChanged = viewModel::onConfirmPasswordChanged,
				onRequestCodeClick = viewModel::requestPasswordReset,
				onResetPasswordClick = viewModel::submitPasswordReset,
				onTogglePassword = viewModel::togglePasswordVisibility,
				onBackToLoginClick = { navigator.pop() }
			)
		}
	}
}