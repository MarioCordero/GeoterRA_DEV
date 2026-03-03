package ucr.ac.cr.inii.geoterra.presentation.screens.register

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import cafe.adriel.voyager.core.screen.Screen
import cafe.adriel.voyager.navigator.LocalNavigator
import cafe.adriel.voyager.navigator.currentOrThrow
import org.koin.compose.koinInject
import ucr.ac.cr.inii.geoterra.presentation.components.layout.AdaptiveBackButton
import ucr.ac.cr.inii.geoterra.presentation.screens.analysisform.AnalysisFormScreen
import ucr.ac.cr.inii.geoterra.presentation.screens.request.RequestsContent

class RegisterScreen : Screen {
  @Composable
  override fun Content() {
    val navigator = LocalNavigator.currentOrThrow
    val viewModel: RegisterViewModel = koinInject()
    val state by viewModel.state.collectAsState()

    Scaffold(
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
      RegisterContent(
        modifier = Modifier.padding(padding),
        state = state,
        onEvent = viewModel,
        onBack = { navigator.pop() }
      )
    }
  }
}