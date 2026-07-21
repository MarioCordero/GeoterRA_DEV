package ucr.ac.cr.inii.geoterra.presentation.components.common

import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import ucr.ac.cr.inii.geoterra.getPlatform

@Composable
fun AdaptiveBackButton(
  onBack: () -> Unit,
  modifier: Modifier = Modifier
) {
  val platform = getPlatform()

  if (platform.isIOS) {
    IconButton(
      onClick = onBack,
      modifier = modifier.size(44.dp),
    ) {
      Icon(
        imageVector = Icons.Default.Close,
        contentDescription = "Cerrar",
        modifier = Modifier.size(24.dp)
      )
    }
  }
}