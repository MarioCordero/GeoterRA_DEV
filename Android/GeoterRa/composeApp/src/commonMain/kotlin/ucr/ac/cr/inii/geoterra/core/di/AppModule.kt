package ucr.ac.cr.inii.geoterra.core.di

import com.russhwolf.settings.Settings
import org.koin.dsl.module
import ucr.ac.cr.inii.geoterra.data.repository.AuthRepositoryImpl
import ucr.ac.cr.inii.geoterra.data.repository.UserRepositoryImpl
import ucr.ac.cr.inii.geoterra.domain.repository.AuthRepository
import ucr.ac.cr.inii.geoterra.domain.repository.UserRepository
import ucr.ac.cr.inii.geoterra.presentation.auth.AuthViewModel
import ucr.ac.cr.inii.geoterra.presentation.screens.account.AccountViewModel
import ucr.ac.cr.inii.geoterra.presentation.screens.home.HomeViewModel
import ucr.ac.cr.inii.geoterra.presentation.screens.login.LoginViewModel

val appModule = module {
    // Aquí registraremos los ViewModels (ScreenModels)
    single<UserRepository> { UserRepositoryImpl(get()) }
    single { AuthViewModel(get(), get()) }
    single { Settings()}// 'single' porque solo queremos una sesión en toda la app
    factory { HomeViewModel() }
    factory { AccountViewModel(get(), get()) }
    // LoginViewModel now receives BOTH dependencies from Koin
    factory { LoginViewModel(get(), get()) }
    // Repository implementation
    single<AuthRepository> { AuthRepositoryImpl(get(), get()) }
}