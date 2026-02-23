package ucr.ac.cr.inii.geoterra.presentation.components.request

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

@Composable
fun StatusBadge(status: String) {
  val color = when (status) {
    "Aceptado" -> Color(0xFF4CAF50)
    "Rechazado" -> Color(0xFFF44336)
    else -> Color(0xFFF57C00)
  }
  Surface(
    color = color.copy(alpha = 0.1f),
    shape = CircleShape,
    border = BorderStroke(1.dp, color)
  ) {
    Text(
      text = status,
      modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp),
      style = MaterialTheme.typography.labelSmall,
      color = color
    )
  }
}