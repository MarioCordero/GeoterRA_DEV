package ucr.ac.cr.inii.geoterra.presentation.components.camera

import androidx.compose.runtime.Composable
import io.github.ismoy.imagepickerkmp.presentation.ui.components.GalleryPickerLauncher
import ucr.ac.cr.inii.geoterra.data.model.local.UserLocation

@Composable
fun GalleryLauncher(
  show: Boolean,
  onDismiss: () -> Unit,
  onPhotoReady: (uri: String, location: UserLocation?) -> Unit,
  onMessage: (String) -> Unit
) {
  if (show) {
    GalleryPickerLauncher(
      allowMultiple = false,
      includeExif = true,
      onPhotosSelected = { results ->
        val photo = results.firstOrNull()
        val location = photo?.exif?.let {
          if (it.latitude != null && it.longitude != null)
            UserLocation(it.latitude!!, it.longitude!!, 0f) else null
        }
        if (photo != null) onPhotoReady(photo.uri, location)
        onDismiss()
      },
      onDismiss = onDismiss,
      onError = { onMessage("Error en galería: ${it.message}"); onDismiss() }
    )
  }
}