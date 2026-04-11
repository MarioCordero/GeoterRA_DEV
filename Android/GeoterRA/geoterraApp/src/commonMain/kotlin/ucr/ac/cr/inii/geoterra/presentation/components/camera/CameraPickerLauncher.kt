package ucr.ac.cr.inii.geoterra.presentation.components.camera

import androidx.compose.runtime.Composable
import androidx.compose.runtime.rememberCoroutineScope
import io.github.ismoy.imagepickerkmp.domain.config.CameraCaptureConfig
import io.github.ismoy.imagepickerkmp.domain.config.ImagePickerConfig
import io.github.ismoy.imagepickerkmp.presentation.ui.components.ImagePickerLauncher
import kotlinx.coroutines.launch
import ucr.ac.cr.inii.geoterra.data.model.local.UserLocation

// ucr.ac.cr.inii.geoterra.presentation.components.media.MediaLaunchers.kt

// ucr.ac.cr.inii.geoterra.domain.camera.CameraPickerLauncher.kt

@Composable
fun CameraLauncher(
  show: Boolean,
  onDismiss: () -> Unit,
  onPhotoReady: (uri: String, location: UserLocation?) -> Unit,
  onMessage: (String) -> Unit
) {
  val scope = rememberCoroutineScope()

  if (show) {
    ImagePickerLauncher(
      config = ImagePickerConfig(
        onPhotoCaptured = { result ->
          scope.launch {
            // 1. Intentamos obtener ubicación del EXIF del resultado
            val location = result.exif?.let {
              if (it.latitude != null && it.longitude != null)
                UserLocation(it.latitude!!, it.longitude!!, 0f) else null
            }

            println(result.exif)

            onPhotoReady(result.uri, location)
            onDismiss()
          }
        },
        cameraCaptureConfig = CameraCaptureConfig(
          includeExif = true
        ),
        onDismiss = onDismiss,
        onError = {
          onMessage("Error: ${it.message}")
          onDismiss()
        }
      )
    )
  }
}
