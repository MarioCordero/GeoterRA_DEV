package ucr.ac.cr.inii.geoterra.presentation.screens.request

import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.Scaffold
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import cafe.adriel.voyager.core.screen.Screen
import cafe.adriel.voyager.navigator.LocalNavigator
import cafe.adriel.voyager.navigator.currentOrThrow
import org.koin.compose.koinInject
import ucr.ac.cr.inii.geoterra.data.model.remote.AnalysisRequestRemote
import ucr.ac.cr.inii.geoterra.presentation.components.analysisform.RequestDetailSheet
import ucr.ac.cr.inii.geoterra.presentation.screens.analysisform.AnalysisFormScreen

class RequestsScreen : Screen {
  @OptIn(ExperimentalMaterial3Api::class)
  @Composable
  override fun Content() {
    val viewModel = koinInject<RequestViewModel>()
    val state by viewModel.state.collectAsState()
    val navigator = LocalNavigator.currentOrThrow
    
    var selectedRequest by remember { mutableStateOf<AnalysisRequestRemote?>(null) }
    val sheetState = rememberModalBottomSheetState()

    if (selectedRequest != null) {
      ModalBottomSheet(
        onDismissRequest = { selectedRequest = null },
        sheetState = sheetState,
        containerColor = MaterialTheme.colorScheme.background,
        shape = RoundedCornerShape(topStart = 32.dp, topEnd = 32.dp),
        tonalElevation = 8.dp
      ) {
        RequestDetailSheet(request = selectedRequest!!)
      }
    }
    
    Scaffold(
      floatingActionButton = {
        FloatingActionButton(
          onClick = { navigator.push(AnalysisFormScreen()) },
          containerColor = MaterialTheme.colorScheme.primary,
          contentColor = MaterialTheme.colorScheme.onPrimary
        ) {
          Icon(Icons.Default.Add, contentDescription = "Crear")
        }
      }
    ) { padding ->
      RequestsContent(
        modifier = Modifier.padding(padding),
        state = state,
        onView = { request -> selectedRequest = request },
        onEdit = { request -> navigator.push(AnalysisFormScreen(request)) },
        onDelete = { request -> viewModel.deleteRequest(request.id) },
      )
    }
  }
}