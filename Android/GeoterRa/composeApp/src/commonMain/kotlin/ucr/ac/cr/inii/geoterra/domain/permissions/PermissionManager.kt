package ucr.ac.cr.inii.geoterra.domain.permissions

interface PermissionManager {
  
  suspend fun requestLocationPermission(): Boolean
  
  fun hasLocationPermission(): Boolean
}