package ucr.ac.cr.inii.geoterra.presentation.components.layout

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Error
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import ucr.ac.cr.inii.geoterra.themes.SuccessGreen

@Composable
fun StatusDialog(
  isSuccess: Boolean,
  message: String,
  onDismiss: () -> Unit
) {
  AlertDialog(
    onDismissRequest = onDismiss,
    shape = RoundedCornerShape(28.dp),
    icon = {
      val color = if (isSuccess) SuccessGreen else MaterialTheme.colorScheme.error
      Surface(
        color = color.copy(alpha = 0.1f),
        shape = CircleShape,
        modifier = Modifier.size(64.dp)
      ) {
        Icon(
          imageVector = if (isSuccess) Icons.Default.CheckCircle else Icons.Default.Error,
          contentDescription = null,
          tint = color,
          modifier = Modifier.padding(12.dp)
        )
      }
    },
    title = {
      Text(
        text = if (isSuccess) "¡Éxito!" else "Hubo un problema",
        style = MaterialTheme.typography.headlineSmall,
        fontWeight = FontWeight.ExtraBold,
        textAlign = TextAlign.Center,
        modifier = Modifier.fillMaxWidth()
      )
    },
    text = {
      Text(
        text = message,
        style = MaterialTheme.typography.bodyMedium,
        textAlign = TextAlign.Center,
        modifier = Modifier.fillMaxWidth()
      )
    },
    confirmButton = {
      TextButton(
        onClick = onDismiss,
        modifier = Modifier.fillMaxWidth()
      ) {
        Text("Entendido", fontWeight = FontWeight.Bold)
      }
    }
  )
}