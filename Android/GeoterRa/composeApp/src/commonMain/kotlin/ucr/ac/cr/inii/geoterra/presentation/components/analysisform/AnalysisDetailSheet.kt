package ucr.ac.cr.inii.geoterra.presentation.components.analysisform

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.BubbleChart
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Thermostat
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import ucr.ac.cr.inii.geoterra.data.model.remote.AnalysisRequestRemote
import ucr.ac.cr.inii.geoterra.presentation.components.layout.SectionHeader
import ucr.ac.cr.inii.geoterra.presentation.components.request.StatusBadge

@Composable
fun RequestDetailSheet(request: AnalysisRequestRemote) {
  Column(
    modifier = Modifier
      .fillMaxWidth()
      .padding(horizontal = 24.dp)
      .padding(bottom = 48.dp)
  ) {
    
    Row(
      modifier = Modifier.fillMaxWidth(),
      horizontalArrangement = Arrangement.SpaceBetween,
      verticalAlignment = Alignment.Top
    ) {
      Column(modifier = Modifier.weight(1f)) {
        Text(
          text = request.name,
          style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.ExtraBold),
          color = MaterialTheme.colorScheme.onSurface
        )
        Text(
          text = "ID: ${request.id.take(8).uppercase()}",
          style = MaterialTheme.typography.labelMedium,
          color = MaterialTheme.colorScheme.primary.copy(alpha = 0.7f)
        )
      }
      
      StatusBadge(state = request.state)
    }
    
    Spacer(modifier = Modifier.height(24.dp))
    
    SectionHeader(title = "Información del Sitio", icon = Icons.Default.LocationOn)
    
    Card(
      colors = CardDefaults.cardColors(
        containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f)
      ),
      shape = RoundedCornerShape(20.dp)
    ) {
      Column(modifier = Modifier.padding(16.dp)) {
        InfoGridRow(
          label1 = "Propietario", value1 = request.owner_name ?: "N/D",
          label2 = "Contacto", value2 = request.owner_contact_number ?: "N/D"
        )
        HorizontalDivider(
          modifier = Modifier.padding(vertical = 12.dp),
          thickness = 0.5.dp,
          color = MaterialTheme.colorScheme.outline
        )
        InfoGridRow(
          label1 = "Región", value1 = (request.region)
        )
        HorizontalDivider(
          modifier = Modifier.padding(vertical = 12.dp),
          thickness = 0.5.dp,
          color = MaterialTheme.colorScheme.outline
        )
        InfoGridRow(
          label1 = "Uso actual", value1 = request.current_usage ?: "N/D"
        )
        HorizontalDivider(
          modifier = Modifier.padding(vertical = 12.dp),
          thickness = 0.5.dp,
          color = MaterialTheme.colorScheme.outline
        )
        InfoGridRow(
          label1 = "Latitud", value1 = (request.latitude),
          label2 = "Longitud", value2 = (request.longitude)
        )
      }
    }
    
    Spacer(modifier = Modifier.height(24.dp))
    SectionHeader(title = "Observaciones Físicas", icon = Icons.Default.Visibility)
    
    Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
      ObservationChip(
        label = "Sensación",
        value = request.temperature_sensation ?: "N/A",
        icon = Icons.Default.Thermostat,
        modifier = Modifier.weight(1f)
      )
      ObservationChip(
        label = "Burbujas",
        value = if (request.bubbles == 1) "Presentes" else "Ausentes",
        icon = Icons.Default.BubbleChart,
        modifier = Modifier.weight(1f)
      )
    }
    
    if (!request.details.isNullOrBlank()) {
      Spacer(modifier = Modifier.height(24.dp))
      SectionHeader(title = "Notas de Campo", icon = Icons.Default.Description)
      Surface(
        modifier = Modifier.fillMaxWidth(),
        color = MaterialTheme.colorScheme.primaryContainer,
        shape = RoundedCornerShape(16.dp),
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant)
      ) {
        Text(
          text = request.details,
          modifier = Modifier.padding(16.dp),
          style = MaterialTheme.typography.bodyMedium,
          color = MaterialTheme.colorScheme.onPrimaryContainer
        )
      }
    }
    
    Text(
      text = "Solicitado el ${request.created_at}",
      style = MaterialTheme.typography.labelSmall,
      color = MaterialTheme.colorScheme.onPrimaryContainer,
      modifier = Modifier.padding(top = 24.dp).align(Alignment.CenterHorizontally)
    )
  }
}
