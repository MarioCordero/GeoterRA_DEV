package ucr.ac.cr.inii.geoterra.presentation.components.layout

import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBackIosNew
import androidx.compose.material3.FilledIconButton
import androidx.compose.material3.Icon
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
    FilledIconButton(
      onClick = onBack,
      modifier = modifier.size(45.dp),
      colors = IconButtonDefaults.filledIconButtonColors(
        containerColor = MaterialTheme.colorScheme.surface.copy(alpha = 0.8f),
        contentColor = MaterialTheme.colorScheme.primary
      ),
      shape = RoundedCornerShape(12.dp)
    ) {
      Icon(
        imageVector = Icons.Default.ArrowBackIosNew,
        contentDescription = "Regresar",
        modifier = Modifier.size(25.dp)
      )
    }
  }
}