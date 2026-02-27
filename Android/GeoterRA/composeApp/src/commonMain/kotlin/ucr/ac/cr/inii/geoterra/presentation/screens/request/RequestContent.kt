package ucr.ac.cr.inii.geoterra.presentation.screens.request

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import ucr.ac.cr.inii.geoterra.data.model.remote.AnalysisRequestRemote
import ucr.ac.cr.inii.geoterra.presentation.components.request.RequestCardItem

@Composable
fun RequestsContent(
  state: RequestState,
  modifier: Modifier = Modifier,
  onView: (AnalysisRequestRemote) -> Unit,
  onEdit: (AnalysisRequestRemote) -> Unit,
  onDelete: (AnalysisRequestRemote) -> Unit
) {
  Column(modifier = modifier.fillMaxSize()) {
    Text(
      text = "Solicitudes",
      style = MaterialTheme.typography.headlineMedium,
      fontWeight = FontWeight.Bold,
      modifier = Modifier.padding(16.dp),
      color = Color(0xFF1A237E)
    )
    
    if (state.isLoading) {
      LinearProgressIndicator(modifier = Modifier.fillMaxWidth(), color = Color(0xFFF57C00))
    }
    
    state.errorMessage?.let {
      Text(
        text = it,
        color = MaterialTheme.colorScheme.error,
        modifier = Modifier.padding(16.dp)
      )
    }
    
    LazyColumn(
      contentPadding = PaddingValues(16.dp),
      verticalArrangement = Arrangement.spacedBy(16.dp),
      modifier = Modifier.fillMaxSize()
    ) {
      items(state.requests, key = { it.id }) { request ->
        RequestCardItem(
          request = request,
          onView = { onView(request) },
          onEdit = { onEdit(request) },
          onDelete = { onDelete(request) }
        )
      }
    }
  }
}