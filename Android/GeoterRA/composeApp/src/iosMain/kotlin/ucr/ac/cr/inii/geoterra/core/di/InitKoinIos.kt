package ucr.ac.cr.inii.geoterra.core.di

import org.koin.dsl.module
import ucr.ac.cr.inii.geoterra.domain.camera.CameraManager
import ucr.ac.cr.inii.geoterra.domain.camera.IosCameraManager
import ucr.ac.cr.inii.geoterra.domain.location.IosLocationProvider
import ucr.ac.cr.inii.geoterra.domain.location.LocationProvider
import ucr.ac.cr.inii.geoterra.domain.permissions.IosPermissionManager
import ucr.ac.cr.inii.geoterra.domain.permissions.PermissionManager

object initKoinIos {
  fun start() {
    val iosModules = module {
      single<LocationProvider> { IosLocationProvider() }
      single<PermissionManager> { IosPermissionManager() }
      single<CameraManager> { IosCameraManager(get()) }
    }

    initKoin(additionalModules = listOf(iosModules))
  }
}