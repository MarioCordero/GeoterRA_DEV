package ucr.ac.cr.inii.geoterra.core.di

import org.koin.core.context.startKoin

/**
 * Initializes Koin for non-Android platforms.
 */
fun initKoin() {
    startKoin {
        modules(appModule)
    }
}
