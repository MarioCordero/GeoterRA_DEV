package ucr.ac.cr.inii.geoterra.presentation.screens.register

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import cafe.adriel.voyager.core.screen.Screen
import cafe.adriel.voyager.koin.getScreenModel
import cafe.adriel.voyager.navigator.LocalNavigator
import cafe.adriel.voyager.navigator.currentOrThrow
import ucr.ac.cr.inii.geoterra.presentation.components.layout.AdaptiveBackButton
import ucr.ac.cr.inii.geoterra.presentation.components.layout.LoadingDialog
import ucr.ac.cr.inii.geoterra.presentation.components.layout.StatusDialog
import ucr.ac.cr.inii.geoterra.presentation.components.layout.SuccessActionDialog

class RegisterScreen : Screen {
  @Composable
  override fun Content() {
    val navigator = LocalNavigator.currentOrThrow
    val viewModel = getScreenModel<RegisterViewModel>()
    val state by viewModel.state.collectAsState()

    val snackBarState = remember { SnackbarHostState() }

    if (state.isLoading) {
      LoadingDialog(
        isVisible = state.isLoading,
        message = "Creando cuenta..."
      )
    }

    if (state.isSuccess) {
      SuccessActionDialog(
        message = "¡Cuenta creada con éxito! Ya puedes iniciar sesión.",
        confirmText = "Aceptar",
        onConfirm = {
          viewModel.clearStatus()
          navigator.pop() // Navega hacia atrás después de confirmar
        },
        onDismiss = {
          viewModel.clearStatus()
          navigator.pop()
        }
      )
    }

    if (state.errorMessage != null) {
      StatusDialog(
        isSuccess = false,
        message = state.errorMessage!!,
        onDismiss = { viewModel.clearStatus() }
      )
    }

    Scaffold(
      snackbarHost = { SnackbarHost(hostState = snackBarState) },
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
      RegisterContent(
        modifier = Modifier.padding(padding),
        state = state,
        snackBarState = snackBarState,
        onEvent = viewModel,
        onBack = { navigator.pop() }
      )
    }
  }
}