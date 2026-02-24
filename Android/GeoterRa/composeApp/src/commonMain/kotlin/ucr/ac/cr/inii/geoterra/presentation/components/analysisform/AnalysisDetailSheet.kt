package ucr.ac.cr.inii.geoterra.presentation.components.analysisform

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import ucr.ac.cr.inii.geoterra.data.model.remote.AnalysisRequestRemote

@Composable
fun AnalysisDetailSheet(request: AnalysisRequestRemote) {
  Column(
    modifier = Modifier
      .fillMaxWidth()
      .padding(start = 24.dp, end = 24.dp, bottom = 40.dp)
  ) {
    Badge(
      containerColor = if (request.state == "Pendiente") Color(0xFFFFD600) else Color(0xFF4CAF50),
      modifier = Modifier.padding(bottom = 8.dp)
    ) {
      Text(request.state, modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp))
    }
    
    Text(
      request.name,
      style = MaterialTheme.typography.headlineMedium,
      fontWeight = FontWeight.Bold
    )
    Text(
      "Creado el: ${request.created_at}",
      style = MaterialTheme.typography.labelSmall,
      color = Color.Gray
    )
    
    HorizontalDivider(Modifier.padding(vertical = 16.dp))
    
    DetailRow("Propietario", request.owner_name ?: "No indicado")
    DetailRow("Uso actual", request.current_usage ?: "No indicado")
    DetailRow("Ubicación", "${request.latitude}, ${request.longitude}")
    DetailRow("Sensación", request.temperature_sensation ?: "N/A")
    DetailRow("Burbujas", if (request.bubbles == 1) "Sí" else "No")
    
    if (!request.details.isNullOrBlank()) {
      Spacer(Modifier.height(16.dp))
      Text(
        "Detalles adicionales:",
        fontWeight = FontWeight.Bold,
        style = MaterialTheme.typography.bodyLarge
      )
      Text(request.details, style = MaterialTheme.typography.bodyMedium)
    }
  }
}

@Composable
fun DetailRow(label: String, value: String) {
  Row(Modifier.padding(vertical = 4.dp)) {
    Text("$label: ", fontWeight = FontWeight.Bold, color = Color(0xFF1A237E))
    Text(value)
  }
}