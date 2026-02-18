package ucr.ac.cr.inii.geoterra.core.di

import com.russhwolf.settings.Settings
import org.koin.dsl.module
import ucr.ac.cr.inii.geoterra.data.repository.AnalysisRequestRepositoryImpl
import ucr.ac.cr.inii.geoterra.data.repository.AuthRepositoryImpl
import ucr.ac.cr.inii.geoterra.data.repository.UserRepositoryImpl
import ucr.ac.cr.inii.geoterra.domain.repository.AnalysisRequestRepository
import ucr.ac.cr.inii.geoterra.domain.repository.AuthRepository
import ucr.ac.cr.inii.geoterra.domain.repository.UserRepository
import ucr.ac.cr.inii.geoterra.presentation.auth.AuthViewModel
import ucr.ac.cr.inii.geoterra.presentation.screens.account.AccountViewModel
import ucr.ac.cr.inii.geoterra.presentation.screens.analysisform.AnalysisFormViewModel
import ucr.ac.cr.inii.geoterra.presentation.screens.home.HomeViewModel
import ucr.ac.cr.inii.geoterra.presentation.screens.login.LoginViewModel
import ucr.ac.cr.inii.geoterra.presentation.screens.request.RequestViewModel

val appModule = module {
    // ViewModels (ScreenModels)
    factory { HomeViewModel() }
    factory { AccountViewModel(get(), get()) }
    factory { LoginViewModel(get(), get()) }
    factory { RequestViewModel(get()) }
    factory { AnalysisFormViewModel(get()) }

    // Util modules
    single { AuthViewModel(get(), get()) }
    single { Settings()}

    // Repository implementation
    single<AuthRepository> { AuthRepositoryImpl(get(), get()) }
    single<UserRepository> { UserRepositoryImpl(get()) }
    single<AnalysisRequestRepository> { AnalysisRequestRepositoryImpl(get()) }

}