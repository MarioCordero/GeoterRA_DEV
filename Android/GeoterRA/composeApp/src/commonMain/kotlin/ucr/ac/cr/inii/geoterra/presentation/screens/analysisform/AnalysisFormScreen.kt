package ucr.ac.cr.inii.geoterra.presentation.screens.analysisform

import androidx.compose.runtime.Composable
import cafe.adriel.voyager.core.screen.Screen
import cafe.adriel.voyager.navigator.LocalNavigator
import cafe.adriel.voyager.navigator.currentOrThrow
import ucr.ac.cr.inii.geoterra.data.model.remote.AnalysisRequestRemote
import org.koin.compose.koinInject
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue

// Pasamos el objeto opcional para saber si editamos o creamos
data class AnalysisFormScreen(val requestToEdit: AnalysisRequestRemote? = null) : Screen {
  
  @Composable
  override fun Content() {
    val navigator = LocalNavigator.currentOrThrow
    // Inyectamos el ViewModel pasando la data inicial si existe
    val viewModel =
      koinInject<AnalysisFormViewModel> { org.koin.core.parameter.parametersOf(requestToEdit) }
    val state by viewModel.state.collectAsState()
    
    if (state.isSuccess) {
      navigator.pop() // Volver atrás al terminar con éxito
    }
    
    AnalysisFormContent(
      state = state,
      onEvent = viewModel::onEvent,
      onCancel = { navigator.pop() }
    )
  }
}