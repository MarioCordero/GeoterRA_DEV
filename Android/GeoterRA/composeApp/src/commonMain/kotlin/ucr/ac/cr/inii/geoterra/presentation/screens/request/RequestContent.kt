package ucr.ac.cr.inii.geoterra.presentation.screens.request

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
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
  
  Scaffold(
    topBar = {
      Column(modifier = Modifier.padding(horizontal = 20.dp, vertical = 10.dp)) {
        Text(
          text = "Mis Solicitudes",
          style = MaterialTheme.typography.headlineMedium,
          fontWeight = FontWeight.Bold,
          color = MaterialTheme.colorScheme.secondary
        )
      }
    }
  ) { paddingValues ->
    
    Box(modifier = Modifier.fillMaxSize().padding(paddingValues)) {
      if (state.isLoading) {
        CircularProgressIndicator(modifier = Modifier.align(Alignment.Center))
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
  
  
//  Column(Modifier.fillMaxWidth()) {
//    Text(
//      text = "Solicitudes",
//      style = MaterialTheme.typography.headlineMedium,
//      fontWeight = FontWeight.Bold,
//      modifier = Modifier.padding(horizontal = 18.dp),
//      color = MaterialTheme.colorScheme.primary
//    )
//  }
}