package ucr.ac.cr.inii.geoterra.presentation.components.common

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp

/**
 * A stylized secondary action button that complies with custom outlining
 * and theme colors, used primarily for alternative actions like resetting filters.
 *
 * @param isLoading Controls the loading state animation inside the button.
 * @param text The business-level string label displayed inside the button.
 * @param onClick Callback executed when the button is pressed.
 * @param modifier Custom layouts modifiers passed down from the parent composable.
 */
@Composable
fun OutlinedActionButton(
  isLoading: Boolean = false,
  text: String,
  onClick: () -> Unit,
  modifier: Modifier = Modifier
) {
  OutlinedButton(
    onClick = onClick,
    modifier = modifier.fillMaxWidth().height(58.dp),
    shape = RoundedCornerShape(16.dp),
    border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline),
    enabled = !isLoading
  ) {
    if (isLoading) {
      CircularProgressIndicator(
        modifier = Modifier.size(24.dp),
        color = MaterialTheme.colorScheme.outline,
        strokeWidth = 3.dp
      )
    } else {
      Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(8.dp)
      ) {
        Text(
          text = text,
          style = MaterialTheme.typography.titleMedium.copy(
            fontWeight = FontWeight.Bold
          ),
          color = MaterialTheme.colorScheme.onSurface
        )
      }
    }
  }
}