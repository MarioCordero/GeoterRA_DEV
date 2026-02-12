package ucr.ac.cr.inii.geoterra.core.di

import com.kdroid.kmplog.Log
import com.kdroid.kmplog.i
import org.koin.core.context.startKoin
import org.koin.dsl.module
import ucr.ac.cr.inii.geoterra.presentation.auth.AuthViewModel
import ucr.ac.cr.inii.geoterra.presentation.screens.home.HomeViewModel
import ucr.ac.cr.inii.geoterra.presentation.screens.login.LoginViewModel

val appModule = module {
    // Aquí registraremos los ViewModels (ScreenModels)
    // factory { HomeViewModel(get()) }
    single { AuthViewModel() } // 'single' porque solo queremos una sesión en toda la app
    factory { HomeViewModel() }
    factory { LoginViewModel(get()) } // Nuevo
}