package ucr.ac.cr.inii.geoterra.presentation.components.map

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Thermostat
import androidx.compose.material.icons.filled.WaterDrop
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import ucr.ac.cr.inii.geoterra.data.model.remote.ManifestationRemote
import ucr.ac.cr.inii.geoterra.presentation.components.layout.InfoBadge

@Composable
fun ManifestationInfoPanel(
  modifier: Modifier = Modifier,
  manifestation: ManifestationRemote,
  onViewFullDetails: () -> Unit
) {
  Card(
    modifier = modifier
      .fillMaxWidth(0.92f)
      .padding(bottom = 24.dp),
    shape = RoundedCornerShape(28.dp),
    elevation = CardDefaults.cardElevation(defaultElevation = 12.dp),
    colors = CardDefaults.cardColors(
      containerColor = MaterialTheme.colorScheme.primaryContainer
    )
  ) {
    Column(
      modifier = Modifier.padding(20.dp),
      horizontalAlignment = Alignment.Start
    ) {
      Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier.fillMaxWidth()
      ) {
        Box(
          modifier = Modifier
            .background(MaterialTheme.colorScheme.primary, RoundedCornerShape(12.dp))
            .padding(8.dp)
        ) {
          Icon(
            imageVector = Icons.Default.LocationOn,
            contentDescription = null,
            tint = MaterialTheme.colorScheme.onPrimary,
            modifier = Modifier.size(24.dp)
          )
        }
        
        Spacer(Modifier.width(8.dp))
        Column {
          Text(
            text = manifestation.name,
            style = MaterialTheme.typography.titleLarge.copy(
              fontWeight = FontWeight.ExtraBold,
              letterSpacing = 0.5.sp
            ),
            color = MaterialTheme.colorScheme.onSurface
          )
          Text(
            text = manifestation.region,
            style = MaterialTheme.typography.bodyLarge.copy(fontWeight = FontWeight.Bold),
            color = MaterialTheme.colorScheme.primary.copy(alpha = 0.8f)
          )
          Text(
            text = "Lat: ${manifestation.latitude}, Lon: ${manifestation.longitude}",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onPrimaryContainer,
            modifier = Modifier.padding(top = 2.dp)
          )
        }
      }
      
      HorizontalDivider(
        modifier = Modifier.padding(vertical = 12.dp),
        thickness = 0.5.dp,
        color = MaterialTheme.colorScheme.outlineVariant
      )
      
      // Properties section
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween
      ) {
        InfoBadge(
          label = "Temperatura",
          value = "${manifestation.temperature ?: "--"}°C",
          icon = Icons.Default.Thermostat,
          color = Color(0xFFFF5722)
        )
        InfoBadge(
          label = "pH",
          value = "${manifestation.field_pH ?: "--"}",
          icon = Icons.Default.WaterDrop,
          color = Color(0xff2196f6)
        )
        InfoBadge(
          label = "Conductividad",
          value = "${manifestation.field_conductivity ?: "--"}",
          icon = Icons.Default.Info,
          color = Color(0xFF4CAF50)
        )
      }
      
      Spacer(modifier = Modifier.height(20.dp))
      
      Button(
        onClick = onViewFullDetails,
        modifier = Modifier
          .fillMaxWidth()
          .height(52.dp),
        shape = RoundedCornerShape(16.dp),
        colors = ButtonDefaults.buttonColors(
          containerColor = MaterialTheme.colorScheme.primary
        )
      ) {
        Icon(Icons.Default.Info, contentDescription = null)
        Spacer(Modifier.width(8.dp))
        Text(
          "Explorar Detalles Técnicos",
          style = MaterialTheme.typography.labelLarge.copy(fontWeight = FontWeight.Bold)
        )
      }
    }
  }
}