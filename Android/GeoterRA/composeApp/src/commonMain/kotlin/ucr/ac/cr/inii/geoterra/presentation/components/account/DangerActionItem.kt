package ucr.ac.cr.inii.geoterra.presentation.components.account

import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.width
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp

@Composable
fun DangerActionItem(
  icon: ImageVector,
  title: String,
  isCritical: Boolean = false,
  onClick: () -> Unit
) {
  val color = if (isCritical) Color.Red else Color(0xFFE64A19) // Naranja GeoTerra
  TextButton(
    onClick = onClick,
    modifier = Modifier.fillMaxWidth(),
    contentPadding = PaddingValues(0.dp)
  ) {
    Row(modifier = Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
      Icon(icon, contentDescription = null, tint = color)
      Spacer(Modifier.width(12.dp))
      Text(
        title,
        color = color,
        style = MaterialTheme.typography.bodyLarge,
        fontWeight = FontWeight.Bold
      )
    }
  }
}