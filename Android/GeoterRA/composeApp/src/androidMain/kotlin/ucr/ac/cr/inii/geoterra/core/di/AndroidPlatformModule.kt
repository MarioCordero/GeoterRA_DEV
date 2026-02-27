package ucr.ac.cr.inii.geoterra.core.di

import org.koin.dsl.module
import ucr.ac.cr.inii.geoterra.domain.permissions.AndroidPermissionManager
import ucr.ac.cr.inii.geoterra.domain.permissions.PermissionManager

/**
 * Android-specific dependency definitions.
 *
 * This module should only contain platform bindings.
 * It MUST NOT start Koin.
 */
val androidPlatformModule = module {

  /**
   * PermissionManager binding for Android.
   *
   * The Activity instance will be injected later using parameters.
   */
  factory<PermissionManager> { (activity: android.app.Activity) ->
    AndroidPermissionManager(activity)
  }
}



