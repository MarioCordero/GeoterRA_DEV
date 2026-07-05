package ucr.ac.cr.inii.geoterra.presentation.screens.request

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.LayoutBoundsHolder
import androidx.compose.ui.layout.layoutBounds
import androidx.compose.ui.unit.dp
import ucr.ac.cr.inii.geoterra.data.model.remote.AnalysisRequestRemote
import ucr.ac.cr.inii.geoterra.presentation.components.request.RequestCardItem

@Composable
fun RequestsContent(
  modifier: Modifier,
  state: RequestState,
  onView: (AnalysisRequestRemote) -> Unit,
  onEdit: (AnalysisRequestRemote) -> Unit,
  onDelete: (AnalysisRequestRemote) -> Unit
) {
  Column(
    modifier = modifier
      .fillMaxSize()
  ) {
    if (state.isLoading && state.requests.isEmpty()) {
      Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        CircularProgressIndicator()
      }
    }

    state.snackBarMessage?.let {
      Text(
        text = it,
        color = MaterialTheme.colorScheme.error,
        modifier = Modifier.padding(16.dp)
      )
    }

    LazyColumn(
      contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 8.dp, bottom = 16.dp),
      verticalArrangement = Arrangement.spacedBy(16.dp),
      modifier = Modifier.weight(1f).fillMaxWidth()
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