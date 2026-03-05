package ucr.ac.cr.inii.geoterra.presentation.screens.login

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import cafe.adriel.voyager.core.screen.Screen
import cafe.adriel.voyager.koin.getScreenModel
import cafe.adriel.voyager.navigator.LocalNavigator
import cafe.adriel.voyager.navigator.currentOrThrow
import ucr.ac.cr.inii.geoterra.presentation.screens.register.RegisterScreen

/**
 * Voyager Screen for the Login screen.
 */
class LoginScreen : Screen {
  
  @Composable
  override fun Content() {
    val viewModel = getScreenModel<LoginViewModel>()
    val state by viewModel.state.collectAsState()
    val navigator = LocalNavigator.currentOrThrow

    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(state.snackbarMessage) {
      state.snackbarMessage?.let {
        snackbarHostState.showSnackbar(message = it)
        viewModel.dismissSnackbar()
      }
    }

    Scaffold(
      modifier = Modifier.fillMaxSize(),
      containerColor = Color.Transparent,
      snackbarHost = { SnackbarHost(snackbarHostState) }
    ) { padding ->

      LoginContent(
        modifier = Modifier.padding(padding),
        state = state,
        onEmailChanged = viewModel::onEmailChanged,
        onPasswordChanged = viewModel::onPasswordChanged,
        onLoginClick = viewModel::login,
        onRegisterClick = { navigator.push(RegisterScreen()) },
        onTogglePassword = viewModel::togglePasswordVisibility,
      )
    }
  }
}