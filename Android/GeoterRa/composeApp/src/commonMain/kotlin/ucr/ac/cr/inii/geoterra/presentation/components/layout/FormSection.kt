package ucr.ac.cr.inii.geoterra.presentation.components.layout

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun FormSection(
  title: String? = null,
  icon: ImageVector? = null,
  content: @Composable ColumnScope.() -> Unit
) {
  Column(modifier = Modifier.fillMaxWidth()) {
    if (title != null || icon != null) {
      Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier.padding(bottom = 8.dp)
      ) {
        if (icon != null) {
          Icon(
            icon,
            contentDescription = null,
            tint = Color(0xFFF57C00),
            modifier = Modifier.size(20.dp)
          )
        }
        if (title != null) {
          if (icon != null) Spacer(Modifier.width(8.dp))
          Text(
            text = title,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.onSurface,
            fontSize = 16.sp
          )
        }
      }
    }

    Column(
      modifier = Modifier
        .fillMaxWidth()
        .padding(if (title == null && icon == null) 0.dp else 16.dp),
      verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
      content()
    }
  }
}