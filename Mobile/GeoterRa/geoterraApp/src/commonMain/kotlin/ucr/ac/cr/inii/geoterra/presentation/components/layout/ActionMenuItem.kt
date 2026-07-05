package ucr.ac.cr.inii.geoterra.presentation.components.layout

import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp


@Composable
fun ActionMenuItem(icon: ImageVector, title: String, onClick: () -> Unit) {
  Surface(onClick = onClick, shape = RoundedCornerShape(12.dp), color = Color.Transparent) {
    Row(
      modifier = Modifier.fillMaxWidth().padding(vertical = 14.dp, horizontal = 4.dp),
      verticalAlignment = Alignment.CenterVertically
    ) {
      Icon(icon, contentDescription = null, modifier = Modifier.size(22.dp))
      Spacer(Modifier.width(16.dp))
      Text(title, style = MaterialTheme.typography.labelSmall, color = Color.Gray)
      Spacer(Modifier.weight(1f))
      Icon(Icons.Default.ChevronRight, contentDescription = null, modifier = Modifier.size(16.dp))
    }
  }
}