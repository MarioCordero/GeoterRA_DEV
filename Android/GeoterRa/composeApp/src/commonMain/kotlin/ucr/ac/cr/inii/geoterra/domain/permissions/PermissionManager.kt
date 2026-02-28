package ucr.ac.cr.inii.geoterra.domain.permissions

interface PermissionManager {
  
  suspend fun requestLocationPermission(): Boolean
  
  fun hasLocationPermission(): Boolean

  suspend fun requestCameraPermission(): Boolean

  fun hasCameraPermission(): Boolean
  
  suspend fun requestGalleryPermission(): Boolean
  
  fun hasGalleryPermission(): Boolean
}