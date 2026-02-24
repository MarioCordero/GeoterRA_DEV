package ucr.ac.cr.inii.geoterra.presentation.screens.analysisform

import androidx.compose.runtime.Composable
import cafe.adriel.voyager.core.screen.Screen
import cafe.adriel.voyager.navigator.LocalNavigator
import cafe.adriel.voyager.navigator.currentOrThrow
import ucr.ac.cr.inii.geoterra.data.model.remote.AnalysisRequestRemote
import org.koin.compose.koinInject
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import ucr.ac.cr.inii.geoterra.presentation.screens.home.HomeViewModel

data class AnalysisFormScreen(
  val requestToEdit: AnalysisRequestRemote? = null
) : Screen {
  
  @Composable
  override fun Content() {
    val navigator = LocalNavigator.currentOrThrow
    val viewModel: AnalysisFormViewModel = koinInject()
    val state by viewModel.state.collectAsState()
    
    if (state.isSuccess) {
      navigator.pop()
    }
    
    AnalysisFormContent(
      state = state,
      onEvent = viewModel::onEvent
    )
  }
}