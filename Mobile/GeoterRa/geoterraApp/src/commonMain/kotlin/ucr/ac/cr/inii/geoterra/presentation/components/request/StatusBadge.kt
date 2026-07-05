package ucr.ac.cr.inii.geoterra.presentation.components.request

import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp

@Composable
fun StatusBadge(state: String) {
  val (color, container) = when (state) {
    "Pendiente" -> Color(0xFFFFB300) to Color(0xFFFFF8E1)
    "Completado" -> Color(0xFF4CAF50) to Color(0xFFE8F5E9)
    else -> MaterialTheme.colorScheme.primary to MaterialTheme.colorScheme.primaryContainer
  }
  
  Surface(
    color = container,
    shape = RoundedCornerShape(12.dp)
  ) {
    Text(
      text = state.uppercase(),
      modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
      style = MaterialTheme.typography.labelLarge.copy(fontWeight = FontWeight.Bold),
      color = color
    )
  }
}