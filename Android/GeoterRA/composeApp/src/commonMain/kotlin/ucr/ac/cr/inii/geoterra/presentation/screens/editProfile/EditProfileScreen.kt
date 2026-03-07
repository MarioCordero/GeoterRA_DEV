package ucr.ac.cr.inii.geoterra.presentation.screens.editProfile

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
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
import org.koin.core.parameter.parametersOf
import ucr.ac.cr.inii.geoterra.data.model.remote.UserRemote
import ucr.ac.cr.inii.geoterra.presentation.components.layout.AdaptiveBackButton

class EditProfileScreen(
  private val userProfile: UserRemote
) : Screen {
  @Composable
  override fun Content() {
    val navigator = LocalNavigator.currentOrThrow
    val viewModel = getScreenModel<EditProfileViewModel>(
      parameters = { parametersOf(userProfile) }
    )
    val state by viewModel.state.collectAsState()

    val snackbarHostState = remember { SnackbarHostState() }

    Scaffold(
      snackbarHost = { SnackbarHost(hostState = snackbarHostState) },
      topBar = {
        Row(
          modifier = Modifier.padding(horizontal = 20.dp, vertical = 10.dp),
          verticalAlignment = Alignment.CenterVertically,
          horizontalArrangement = Arrangement.Start
        ) {
          AdaptiveBackButton(onBack = { navigator.pop() })
        }
      }
    ) { padding ->
      EditProfileContent(
        modifier = Modifier.padding(padding),
        state = state,
        snackBarState = snackbarHostState,
        onEvent = viewModel,
        onBack = { navigator.pop() }
      )
    }
  }
}