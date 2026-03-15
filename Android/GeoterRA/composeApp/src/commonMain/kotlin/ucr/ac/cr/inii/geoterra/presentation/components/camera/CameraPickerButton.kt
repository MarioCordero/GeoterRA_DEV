package ucr.ac.cr.inii.geoterra.presentation.components.camera

import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.PhotoCamera
import androidx.compose.material3.Button
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import ucr.ac.cr.inii.geoterra.data.model.local.UserLocation

@Composable
fun CameraPickerButton(
  modifier: Modifier = Modifier,
  onPhotoReady: (uri: String, location: UserLocation?) -> Unit,
  onMessage: (String) -> Unit
) {
  var showCamera by remember { mutableStateOf(false) }

  Button(
    onClick = { showCamera = true },
    modifier = modifier,
    shape = RoundedCornerShape(8.dp)
  ) {
    Icon(Icons.Default.PhotoCamera, contentDescription = null)
    Spacer(Modifier.width(4.dp))
    Text("Tomar Foto", style = MaterialTheme.typography.labelSmall)
  }

  CameraLauncher(
    show = showCamera,
    onDismiss = { showCamera = false },
    onPhotoReady = onPhotoReady,
    onMessage = onMessage
  )
}