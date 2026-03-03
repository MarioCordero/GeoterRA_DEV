package ucr.ac.cr.inii.geoterra.presentation.screens.register

import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import cafe.adriel.voyager.core.screen.Screen
import cafe.adriel.voyager.navigator.LocalNavigator
import cafe.adriel.voyager.navigator.currentOrThrow
import org.koin.compose.koinInject

class RegisterScreen : Screen {
  @Composable
  override fun Content() {
    val navigator = LocalNavigator.currentOrThrow
    val viewModel: RegisterViewModel = koinInject()
    val state by viewModel.state.collectAsState()

    RegisterContent(
      state = state,
      onEvent = viewModel,
      onBack = { navigator.pop() }
    )
  }
}