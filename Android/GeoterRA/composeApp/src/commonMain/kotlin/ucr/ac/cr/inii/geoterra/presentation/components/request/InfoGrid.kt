package ucr.ac.cr.inii.geoterra.presentation.components.request

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import ucr.ac.cr.inii.geoterra.data.model.remote.AnalysisRequestRemote

@Composable
private fun InfoGrid(request: AnalysisRequestRemote) {
  Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
    Row(Modifier.fillMaxWidth()) {
      InfoItem("Fecha", request.created_at, Modifier.weight(1f))
      InfoItem("Región", request.region, Modifier.weight(1f))
    }
    Row(Modifier.fillMaxWidth()) {
      InfoItem("Latitud", request.latitude.toString(), Modifier.weight(1f))
      InfoItem("Longitud", request.longitude.toString(), Modifier.weight(1f))
    }
  }
}

@Composable
private fun InfoItem(label: String, value: String, modifier: Modifier) {
  Column(modifier = modifier) {
    Text(label, style = MaterialTheme.typography.labelSmall, color = Color.Gray)
    Text(value, style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.SemiBold)
  }
}