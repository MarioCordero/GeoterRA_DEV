package ucr.ac.cr.inii.geoterra.domain.permissions

/**
 * Platform-specific context required for managing and requesting permissions.
 */
expect class PermissionContext

/**
 * Manager responsible for checking and requesting platform-specific permissions
 * such as Location, Camera, and Gallery.
 *
 * @param context The platform-specific context required to handle permission requests.
 */
expect class PermissionManager(context: PermissionContext) {

  /**
   * Requests permission to access the device's fine location.
   *
   * @return True if the permission was granted, false otherwise.
   */
  suspend fun requestLocationPermission(): Boolean

  /**
   * Checks whether the application currently has permission to access the device's fine location.
   *
   * @return True if permission is granted, false otherwise.
   */
  fun hasLocationPermission(): Boolean

  /**
   * Requests permission to access the device's camera.
   *
   * @return True if the permission was granted, false otherwise.
   */
  suspend fun requestCameraPermission(): Boolean

  /**
   * Checks whether the application currently has permission to access the device's camera.
   *
   * @return True if permission is granted, false otherwise.
   */
  fun hasCameraPermission(): Boolean

  /**
   * Requests permission to access the device's photo gallery or external storage.
   *
   * @return True if the permission was granted, false otherwise.
   */
  suspend fun requestGalleryPermission(): Boolean

  /**
   * Checks whether the application currently has permission to access the device's photo gallery or external storage.
   *
   * @return True if permission is granted, false otherwise.
   */
  fun hasGalleryPermission(): Boolean
}