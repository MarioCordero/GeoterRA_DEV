package ucr.ac.cr.inii.geoterra.presentation.components.analysisform

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun InfoGridRow(label1: String, value1: String, label2: String? = null, value2: String? = null) {
  Row(modifier = Modifier.fillMaxWidth()) {
    Column(modifier = Modifier.weight(1f)) {
      Text(
        label1,
        style = MaterialTheme.typography.labelSmall,
        color = MaterialTheme.colorScheme.secondary
      )
      Text(
        value1,
        style = MaterialTheme.typography.bodyLarge.copy(fontWeight = FontWeight.SemiBold)
      )
    }
    if (label2 != null && value2 != null) {
      Column(modifier = Modifier.weight(1f)) {
        Text(
          label2,
          style = MaterialTheme.typography.labelSmall,
          color = MaterialTheme.colorScheme.secondary
        )
        Text(
          value2,
          style = MaterialTheme.typography.bodyLarge.copy(fontWeight = FontWeight.SemiBold)
        )
      }
    }
  }
}

@Composable
fun InfoGridItem(
  icon: ImageVector? = null,
  label: String,
  value: String,
  modifier: Modifier = Modifier
) {
  Row(
    modifier = modifier.padding(vertical = 4.dp),
    verticalAlignment = Alignment.CenterVertically
  ) {
    if (icon != null) {
      Icon(
        imageVector = icon,
        contentDescription = null,
        tint = MaterialTheme.colorScheme.primary,
        modifier = Modifier.size(20.dp)
      )
      Spacer(modifier = Modifier.width(12.dp))
    }
    Column {
      Text(
        text = label,
        style = MaterialTheme.typography.labelSmall.copy(
          letterSpacing = 0.5.sp,
          fontWeight = FontWeight.Bold
        ),
        color = MaterialTheme.colorScheme.secondary
      )
      Text(
        text = value,
        style = MaterialTheme.typography.bodyLarge.copy(
          fontWeight = FontWeight.Medium
        ),
        color = MaterialTheme.colorScheme.onSurface
      )
    }
  }
}