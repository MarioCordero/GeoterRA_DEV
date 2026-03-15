package ucr.ac.cr.inii.geoterra.presentation.components.layout

import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBackIosNew
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.FilledIconButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.IconButtonDefaults
import androidx.compose.material3.MaterialTheme
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