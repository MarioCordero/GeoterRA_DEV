package ucr.ac.cr.inii.geoterra.presentation.components.analysisform

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.BubbleChart
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.Explore
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Mail
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.Thermostat
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import ucr.ac.cr.inii.geoterra.data.model.remote.AnalysisRequestRemote
import ucr.ac.cr.inii.geoterra.presentation.components.layout.InfoChip
import ucr.ac.cr.inii.geoterra.presentation.components.layout.SectionHeader
import ucr.ac.cr.inii.geoterra.presentation.components.request.StatusBadge

@Composable
fun RequestDetailSheet(request: AnalysisRequestRemote) {
  val scrollState = rememberScrollState()

  Column(
    modifier = Modifier
      .padding(20.dp)
      .fillMaxSize()
      .verticalScroll(scrollState),
  ) {
    Row(
      modifier = Modifier.fillMaxWidth(),
      horizontalArrangement = Arrangement.SpaceBetween,
      verticalAlignment = Alignment.CenterVertically
    ) {
      Column() {
        Text(
          text = request.name,
          style = MaterialTheme.typography.titleLarge.copy(
            fontWeight = FontWeight.ExtraBold,
            letterSpacing = (-0.5).sp
          ),
          color = MaterialTheme.colorScheme.onSurface,
          maxLines = 1,
          overflow = TextOverflow.Ellipsis
        )
      }
      StatusBadge(request.state)
    }

    Spacer(modifier = Modifier.height(16.dp))

    SectionHeader(title = "Información de Contacto")

    InfoChip(
      icon = Icons.Default.Person,
      label = "Propietario",
      value = request.owner_name ?: "N/D",
      modifier = Modifier.fillMaxWidth(),
      iconColor = MaterialTheme.colorScheme.primary
    )

    Spacer(modifier = Modifier.height(8.dp))

    InfoChip(
      icon = Icons.Default.Mail,
      label = "Número de Contacto",
      value = request.owner_contact_number ?: "N/D",
      modifier = Modifier.fillMaxWidth(),
      iconColor = MaterialTheme.colorScheme.secondary
    )

    Spacer(modifier = Modifier.height(8.dp))

    InfoChip(
      icon = Icons.Default.LocationOn,
      label = "Correo Solicitante",
      value = request.email,
      modifier = Modifier.fillMaxWidth(),
      iconColor = MaterialTheme.colorScheme.secondary
    )

    Spacer(modifier = Modifier.height(16.dp))

    SectionHeader(title = "Información del Sitio")

    InfoChip(
      icon = Icons.Default.LocationOn,
      label = "Región",
      value = request.region,
      modifier = Modifier.fillMaxWidth()
    )

    Spacer(modifier = Modifier.height(8.dp))

    Row(
      modifier = Modifier.fillMaxWidth(),
      horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
      InfoChip(
        icon = Icons.Default.Explore,
        label = "Latitud",
        value = request.latitude.take(8),
        modifier = Modifier.weight(1f),
        iconColor = MaterialTheme.colorScheme.secondary
      )
      InfoChip(
        icon = Icons.Default.Explore,
        label = "Longitud",
        value = request.longitude.take(8),
        modifier = Modifier.weight(1f),
        iconColor = MaterialTheme.colorScheme.secondary
      )
    }

    Spacer(modifier = Modifier.height(16.dp))

    SectionHeader(title = "Observaciones Físicas")

    Row(
      modifier = Modifier.fillMaxWidth(),
      horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
      InfoChip(
        label = "Sensación",
        value = request.temperature_sensation ?: "N/A",
        icon = Icons.Default.Thermostat,
        iconColor = MaterialTheme.colorScheme.primary,
        modifier = Modifier.weight(1f)
      )
      InfoChip(
        label = "Burbujas",
        value = if (request.bubbles == 1) "Presentes" else "Ausentes",
        icon = Icons.Default.BubbleChart,
        iconColor = MaterialTheme.colorScheme.secondary,
        modifier = Modifier.weight(1f)
      )
    }

    if (!request.details.isNullOrBlank()) {
      Spacer(modifier = Modifier.height(16.dp))
      SectionHeader(title = "Notas de Campo")
      InfoChip(
        icon = Icons.Default.Description,
        label = "Detalles",
        value = request.details,
        modifier = Modifier.fillMaxWidth(),
      )
    }

    Spacer(modifier = Modifier.height(16.dp))

    Text(
      text = "Solicitud creada el ${request.created_at}",
      style = MaterialTheme.typography.labelSmall,
      color = MaterialTheme.colorScheme.onSurface,
      modifier = Modifier.align(Alignment.CenterHorizontally)
    )

    Spacer(modifier = Modifier.height(16.dp))

    Button(
      onClick = { /* TODO: Acción de descargar */ },
      modifier = Modifier
        .fillMaxWidth()
        .height(56.dp),
      shape = RoundedCornerShape(16.dp),
      colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
    ) {
      Icon(
        imageVector = Icons.Default.Download,
        contentDescription = "Descargar",
        modifier = Modifier.size(20.dp)
      )
      Spacer(modifier = Modifier.width(8.dp))
      Text("Descargar Solicitud", style = MaterialTheme.typography.titleMedium)
    }

    Spacer(modifier = Modifier.height(24.dp)) // Espacio final para el scroll

  }
}
