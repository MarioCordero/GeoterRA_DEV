package ucr.ac.cr.inii.geoterra.presentation.components.manifestation

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp


@Composable
fun ChemicalRow(label: String, value: Float?) {
  Row(
    modifier = Modifier
      .fillMaxWidth()
      .padding(vertical = 8.dp),
    horizontalArrangement = Arrangement.SpaceBetween,
    verticalAlignment = Alignment.CenterVertically
  ) {
    Text(
      label,
      style = MaterialTheme.typography.bodyMedium,
      color = MaterialTheme.colorScheme.onSurface
    )
    Text(
      text = if (value != null) "$value mg/L" else "N/D",
      style = MaterialTheme.typography.bodyLarge.copy(
        fontWeight = FontWeight.SemiBold,
        fontFeatureSettings = "tnum"
      ),
      color = if (value != null) MaterialTheme.colorScheme.onSurface else MaterialTheme.colorScheme.outline
    )
  }
  HorizontalDivider(thickness = 0.5.dp, color = MaterialTheme.colorScheme.outlineVariant)
}