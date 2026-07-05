package ucr.ac.cr.inii.geoterra.presentation.components.layout

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun StepItem(number: Int, title: String, desc: String) {
  Row(
    modifier = Modifier.padding(horizontal = 24.dp, vertical = 12.dp),
    verticalAlignment = Alignment.Top
  ) {
    Text(
      text = number.toString(),
      fontSize = 40.sp,
      fontWeight = FontWeight.Black,
      color = MaterialTheme.colorScheme.secondary.copy(alpha = 0.4f),
      modifier = Modifier.width(40.dp)
    )
    Column {
      Text(text = title, fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleMedium)
      Text(text = desc, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.outline)
    }
  }
}