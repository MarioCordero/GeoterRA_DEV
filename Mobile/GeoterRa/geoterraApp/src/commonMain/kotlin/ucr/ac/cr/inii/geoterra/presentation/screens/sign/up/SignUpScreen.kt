package ucr.ac.cr.inii.geoterra.presentation.screens.sign

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
import ucr.ac.cr.inii.geoterra.presentation.components.common.AdaptiveBackButton
import ucr.ac.cr.inii.geoterra.presentation.components.common.CustomSnackbarHost
import ucr.ac.cr.inii.geoterra.presentation.components.common.LoadingDialog
import ucr.ac.cr.inii.geoterra.presentation.components.common.TypedSnackbarHostState

class SignUpScreen : Screen {
  override val key: ScreenKey = uniqueScreenKey

  @Composable
  override fun Content() {
    val navigator = LocalNavigator.currentOrThrow
    val viewModel = getScreenModel<SignUpViewModel>()
    val state by viewModel.state.collectAsState()

    val snackbarHostState = remember { TypedSnackbarHostState() }

    if (state.isLoading) {
      LoadingDialog(
        isVisible = state.isLoading,
        message = "Creando cuenta..."
      )
    }

		LaunchedEffect(state.snackBarMessage) {
			state.snackBarMessage?.let { snackbarMsg ->
				snackbarHostState.showSnackbar(
					message = snackbarMsg.text,
					type = snackbarMsg.type
				)
				viewModel.onSnackbarDismissed()
			}
		}

    Scaffold(
      snackbarHost = { CustomSnackbarHost(snackbarHostState) },
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
    ) { paddingValues ->
      SignUpContent(
        modifier = Modifier.padding(top = paddingValues.calculateTopPadding()),
        state = state,
        onEvent = viewModel,
        onBack = { navigator.pop() }
      )
    }
  }
}