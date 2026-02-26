package ucr.ac.cr.inii.geoterra.presentation.components.analysisform

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight

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