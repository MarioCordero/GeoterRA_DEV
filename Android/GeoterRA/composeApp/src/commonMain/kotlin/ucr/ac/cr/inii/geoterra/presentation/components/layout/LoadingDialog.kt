package ucr.ac.cr.inii.geoterra.presentation.components.layout

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties

@Composable
fun LoadingDialog(
  message: String = "Cargando...",
  isVisible: Boolean
) {
  if (isVisible) {
    Dialog(
      onDismissRequest = { },
      properties = DialogProperties(
        dismissOnBackPress = false,
        dismissOnClickOutside = false
      )
    ) {
      Surface(
        shape = RoundedCornerShape(16.dp),
        color = MaterialTheme.colorScheme.surface,
      ) {
        Row(
          modifier = Modifier
            .padding(24.dp)
            .fillMaxWidth(),
          verticalAlignment = Alignment.CenterVertically,
          horizontalArrangement = Arrangement.Center
        ) {
          CircularProgressIndicator(
            modifier = Modifier.size(36.dp),
            strokeWidth = 3.dp
          )
          Spacer(modifier = Modifier.width(20.dp))
          Text(
            text = message,
            style = MaterialTheme.typography.bodyLarge,
            fontWeight = FontWeight.Medium
          )
        }
      }
    }
  }
}