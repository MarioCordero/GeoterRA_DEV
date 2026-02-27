package ucr.ac.cr.inii.geoterra.domain.camera

import ucr.ac.cr.inii.geoterra.data.model.local.UserLocation

interface CameraManager {
  /**
   * Captura una foto y retorna los bytes junto con la ubicación capturada en ese instante.
   */
  suspend fun takePhotoWithLocation(): Pair<ByteArray, UserLocation?>?

  /**
   * Extrae la ubicación de una imagen a partir de sus bytes analizando los metadatos EXIF.
   */
  fun extractLocationFromCache(imageData: ByteArray): UserLocation?
}