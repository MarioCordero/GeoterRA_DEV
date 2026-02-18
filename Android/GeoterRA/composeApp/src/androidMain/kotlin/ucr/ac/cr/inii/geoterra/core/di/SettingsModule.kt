package ucr.ac.cr.inii.geoterra.core.di

import android.content.Context
import com.russhwolf.settings.Settings
import com.russhwolf.settings.SharedPreferencesSettings
import org.koin.dsl.module

actual val platformSettingsModule = module {
    single<Settings> {
        val context: Context = get()
        val sharedPrefs = context.getSharedPreferences("geoterra_secure_prefs", Context.MODE_PRIVATE)
        SharedPreferencesSettings(sharedPrefs)
    }
}