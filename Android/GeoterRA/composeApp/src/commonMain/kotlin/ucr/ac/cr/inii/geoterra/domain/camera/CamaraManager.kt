package ucr.ac.cr.inii.geoterra.domain.camera

import ucr.ac.cr.inii.geoterra.data.model.local.UserLocation

interface CameraManager {
  suspend fun takePhotoWithLocation(location: UserLocation): Pair<ByteArray, UserLocation?>?
  
  suspend fun pickPhotoFromGallery(): ByteArray?

  fun extractLocationFromCache(imageData: ByteArray): UserLocation?
}