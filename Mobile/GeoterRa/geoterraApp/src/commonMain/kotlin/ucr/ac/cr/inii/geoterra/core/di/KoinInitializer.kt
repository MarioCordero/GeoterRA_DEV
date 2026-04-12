package ucr.ac.cr.inii.geoterra.core.di

import org.koin.core.context.startKoin
import org.koin.core.module.Module
import org.koin.dsl.module

/**
 * Initializes Koin for non-Android platforms.
 */
fun initKoin(additionalModules: List<Module> = emptyList()) {
  startKoin {
    modules(
      listOf(
        appModule,
        networkModule,
        platformSettingsModule
      ) + additionalModules
    )
  }
}
