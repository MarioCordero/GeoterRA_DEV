package ucr.ac.cr.inii.geoterra.presentation.components.layout

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import ucr.ac.cr.inii.geoterra.themes.SuccessGreen

@Composable
fun SuccessActionDialog(
  title: String = "¡Éxito!",
  message: String,
  confirmText: String = "Aceptar",
  dismissText: String = "Cerrar",
  onConfirm: () -> Unit,
  onDismiss: () -> Unit
) {
  AlertDialog(
    onDismissRequest = onDismiss,
    shape = RoundedCornerShape(28.dp),
    icon = {
      Surface(
        color = SuccessGreen.copy(alpha = 0.1f),
        shape = CircleShape,
        modifier = Modifier.size(64.dp)
      ) {
        Icon(
          imageVector = Icons.Default.CheckCircle,
          contentDescription = null,
          tint = SuccessGreen,
          modifier = Modifier.padding(12.dp)
        )
      }
    },
    title = {
      Text(
        text = title,
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
      Button(
        onClick = onConfirm,
        shape = RoundedCornerShape(12.dp),
        colors = ButtonDefaults.buttonColors(containerColor = SuccessGreen)
      ) {
        Text(confirmText, fontWeight = FontWeight.Bold)
      }
    },
    dismissButton = {
      TextButton(onClick = onDismiss) {
        Text(dismissText, color = MaterialTheme.colorScheme.outline)
      }
    }
  )
}