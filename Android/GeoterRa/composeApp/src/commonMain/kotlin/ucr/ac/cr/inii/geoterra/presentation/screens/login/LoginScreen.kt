package ucr.ac.cr.inii.geoterra.presentation.screens.login

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import cafe.adriel.voyager.core.screen.Screen
import cafe.adriel.voyager.navigator.LocalNavigator
import cafe.adriel.voyager.navigator.currentOrThrow
import org.koin.compose.koinInject
import ucr.ac.cr.inii.geoterra.presentation.screens.home.HomeContent
import ucr.ac.cr.inii.geoterra.presentation.screens.home.HomeViewModel
import ucr.ac.cr.inii.geoterra.presentation.screens.register.RegisterScreen

/**
 * Voyager Screen for the Login screen.
 */
class LoginScreen : Screen {
  
  @Composable
  override fun Content() {
    val viewModel: LoginViewModel = koinInject()
    val state by viewModel.state.collectAsState()
    val navigator = LocalNavigator.currentOrThrow

    LoginContent(
      state = state,
      onEmailChanged = viewModel::onEmailChanged,
      onPasswordChanged = viewModel::onPasswordChanged,
      onLoginClick = viewModel::login,
      onRegisterClick = { navigator.push(RegisterScreen()) },
      onTogglePassword = viewModel::togglePasswordVisibility,
      onDismissSnackbar = viewModel::dismissSnackbar
    )
  }
}