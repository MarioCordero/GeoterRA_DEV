package ucr.ac.cr.inii.geoterra.presentation.screens.analysisform

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import cafe.adriel.voyager.core.screen.Screen
import cafe.adriel.voyager.navigator.LocalNavigator
import cafe.adriel.voyager.navigator.currentOrThrow
import ucr.ac.cr.inii.geoterra.data.model.remote.AnalysisRequestRemote
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import cafe.adriel.voyager.koin.getScreenModel
import org.koin.core.parameter.parametersOf
import ucr.ac.cr.inii.geoterra.presentation.components.layout.AdaptiveBackButton
import ucr.ac.cr.inii.geoterra.presentation.components.layout.LoadingDialog
import ucr.ac.cr.inii.geoterra.presentation.components.layout.StatusDialog

data class AnalysisFormScreen(
  val requestToEdit: AnalysisRequestRemote? = null
) : Screen {
  
  @Composable
  override fun Content() {
    val navigator = LocalNavigator.currentOrThrow
    val viewModel = getScreenModel<AnalysisFormViewModel>(
      parameters = { parametersOf(requestToEdit) }
    )

    val state by viewModel.state.collectAsState()
    
    if (state.isSuccess) {
      navigator.pop()
    }

    val snackBarHost = remember { SnackbarHostState() }

    LaunchedEffect(state.snackBarMessage) {
      state.snackBarMessage?.let {
        snackBarHost.showSnackbar(message = it)
        viewModel.dismissSnackBar()
      }
    }

    LoadingDialog(
      isVisible = state.isLoading,
    )

    if (state.isSuccess) {
      StatusDialog(
        isSuccess = true,
        message = "La solicitud se ha creado correctamente.",
        onDismiss = {
          viewModel.clearSuccess()
          navigator.pop()
        }
      )
    }

    // 3. DIÁLOGO DE ERROR
    state.error?.let { errorMessage ->
      StatusDialog(
        isSuccess = false,
        message = errorMessage,
        onDismiss = { viewModel.clearError() }
      )
    }

    Scaffold(
      snackbarHost = {SnackbarHost(snackBarHost)},
      modifier = Modifier.fillMaxSize(),
      containerColor = MaterialTheme.colorScheme.background,
      topBar = {
        Row(
          modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp, vertical = 10.dp),
          verticalAlignment = Alignment.CenterVertically,
          horizontalArrangement = Arrangement.Start
        ) {
          Text(
            text = "Nueva solicitud",
            style = MaterialTheme.typography.headlineMedium,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.secondary,
            modifier = Modifier.weight(1f)
          )
          AdaptiveBackButton(onBack = {navigator.pop()})
        }
      }
    ) { paddingValues ->

      AnalysisFormContent(
        modifier = Modifier.padding(paddingValues),
        state = state,
        onEvent = viewModel::onEvent,
      )
    }
  }
}