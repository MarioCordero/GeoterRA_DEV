package ucr.ac.cr.inii.geoterra.presentation.components.request

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.BubbleChart
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Explore
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Mail
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.Thermostat
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import ucr.ac.cr.inii.geoterra.data.model.remote.AnalysisRequestRemote
import ucr.ac.cr.inii.geoterra.presentation.components.layout.InfoChip
import ucr.ac.cr.inii.geoterra.presentation.components.layout.SectionHeader

@Composable
fun RequestBottomModalContent(
  request: AnalysisRequestRemote,
  isForPdf: Boolean = false,
  onDownloadPdf: (AnalysisRequestRemote) -> Unit
) {
  val scrollState = if (!isForPdf) rememberScrollState() else null

  val verticalSpacing = if (isForPdf) 8.dp else 16.dp
  val chipSpacing = if (isForPdf) 4.dp else 8.dp
  val titleSize = if (isForPdf) 18.sp else 22.sp

  Column(
    modifier = Modifier
      .padding(if (isForPdf) 12.dp else 20.dp)
      .then(
        if (isForPdf) Modifier.width(380.dp) else Modifier.fillMaxSize()
      )
      .then(
        if (scrollState != null) Modifier.verticalScroll(scrollState) else Modifier
      ),
  ) {
    Row(
      modifier = Modifier.fillMaxWidth(),
      horizontalArrangement = Arrangement.SpaceBetween,
      verticalAlignment = Alignment.CenterVertically
    ) {
      Text(
        text = request.name,
        style = MaterialTheme.typography.titleLarge.copy(
          fontSize = titleSize,
          fontWeight = FontWeight.ExtraBold,
          letterSpacing = (-0.5).sp
        ),
        color = MaterialTheme.colorScheme.onSurface,
        modifier = Modifier.weight(1f, fill = false),
        maxLines = 1,
        overflow = TextOverflow.Ellipsis
      )
      StatusBadge(request.state)
    }

    Spacer(modifier = Modifier.height(verticalSpacing))
    val fillMaxWidth = Modifier.fillMaxWidth()

    // --- SOLICITANTE ---
    SectionHeader(title = "Información de Solicitante")

    InfoChip(
      Icons.Default.Email,
      "Correo",
      request.email,
      fillMaxWidth,
      MaterialTheme.colorScheme.primary
    )

    Spacer(modifier = Modifier.height(verticalSpacing))

    // --- PROPIETARIO ---
    SectionHeader(title = "Información de Contacto")
    InfoChip(
      Icons.Default.Person,
      "Propietario",
      request.owner_name ?: "N/D",
      fillMaxWidth,
      MaterialTheme.colorScheme.primary
    )
    Spacer(modifier = Modifier.height(chipSpacing))
    InfoChip(
      Icons.Default.Phone,
      "Número",
      request.owner_contact_number ?: "N/D",
      fillMaxWidth,
      MaterialTheme.colorScheme.secondary
    )

    Spacer(modifier = Modifier.height(verticalSpacing))

    // --- SITIO ---
    SectionHeader(title = "Información del Sitio")
    InfoChip(
      Icons.Default.LocationOn,
      "Región",
      request.regionName(),
      Modifier.fillMaxWidth()
    )

    Spacer(modifier = Modifier.height(chipSpacing))

    Row(
      modifier = Modifier.fillMaxWidth(),
      horizontalArrangement = Arrangement.spacedBy(chipSpacing)
    ) {
      val fillMidWidth = Modifier.weight(1f)
      InfoChip(
        Icons.Default.Explore,
        "Lat", request.latitude.take(8),
        fillMidWidth,
        MaterialTheme.colorScheme.secondary
      )
      InfoChip(Icons.Default.Explore,
        "Long", request.longitude.take(8),
        fillMidWidth, MaterialTheme.colorScheme.secondary
      )
    }

    Spacer(modifier = Modifier.height(verticalSpacing))

    // --- OBSERVACIONES ---
    SectionHeader(title = "Observaciones Físicas")
    Row(
      modifier = Modifier.fillMaxWidth(),
      horizontalArrangement = Arrangement.spacedBy(chipSpacing)
    ) {
      val obsModifier = Modifier.weight(1f)
      InfoChip(
        Icons.Default.Thermostat, "Sensación",
        request.temperature_sensation ?: "N/A", obsModifier,
        MaterialTheme.colorScheme.primary
      )
      InfoChip(
        Icons.Default.BubbleChart, "Burbujas",
        if (request.bubbles == 1) "Sí" else "No",
        obsModifier, MaterialTheme.colorScheme.secondary
      )
    }

    // --- NOTAS ---
    Spacer(modifier = Modifier.height(verticalSpacing))

    SectionHeader(title = "Notas de Campo")

    InfoChip(
      Icons.Default.Description,
      "Detalles", request.details ?: "N/D",
      Modifier.fillMaxWidth()
    )

    Spacer(modifier = Modifier.height(verticalSpacing))

    // --- PIE DE PÁGINA ---
    Text(
      text = "Solicitud creada el ${request.created_at}",
      style = MaterialTheme.typography.labelSmall.copy(fontSize = if (isForPdf) 8.sp else 10.sp),
      color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f),
      modifier = Modifier.align(Alignment.CenterHorizontally)
    )

    if (isForPdf) {
      Spacer(modifier = Modifier.height(8.dp))
      Text(
        modifier = Modifier.align(Alignment.CenterHorizontally),
        text ="© 2021 Instituto de Investigaciones en Ingeniería - UCR",
        style = MaterialTheme.typography.labelSmall,
        color = Color.Gray
      )
    }

    if (!isForPdf) {
      Spacer(modifier = Modifier.height(16.dp))
      Button(
        onClick = { onDownloadPdf(request) },
        modifier = Modifier.fillMaxWidth().height(58.dp),
        shape = RoundedCornerShape(16.dp)
      ) {
        Icon(Icons.Default.Download, null, modifier = Modifier.size(20.dp))
        Spacer(modifier = Modifier.width(8.dp))
        Text("Descargar Solicitud", style = MaterialTheme.typography.titleMedium)
      }

      Spacer(modifier = Modifier.height(24.dp))
    }
  }
}
