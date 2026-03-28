package ucr.ac.cr.inii.geoterra.presentation.components.camera

import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.PhotoLibrary
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import ucr.ac.cr.inii.geoterra.data.model.local.UserLocation

// ucr.ac.cr.inii.geoterra.presentation.components.media.MediaButtons.kt

@Composable
fun GalleryPickerButton(
  modifier: Modifier = Modifier,
  onPhotoReady: (uri: String, location: UserLocation?) -> Unit,
  onMessage: (String) -> Unit
) {
  var showGallery by remember { mutableStateOf(false) }

  Button(
    onClick = { showGallery = true },
    modifier = modifier,
    shape = RoundedCornerShape(8.dp),
    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF455A64))
  ) {
    Icon(Icons.Default.PhotoLibrary, contentDescription = null)
    Spacer(Modifier.width(4.dp))
    Text("Elegir Foto", style = MaterialTheme.typography.labelSmall)
  }

  GalleryLauncher(
    show = showGallery,
    onDismiss = { showGallery = false },
    onPhotoReady = onPhotoReady,
    onMessage = onMessage
  )
}