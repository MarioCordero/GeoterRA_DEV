package ucr.ac.cr.inii.geoterra.core.di

import com.russhwolf.settings.Settings
import org.koin.dsl.module
import ucr.ac.cr.inii.geoterra.data.model.remote.AnalysisRequestRemote
import ucr.ac.cr.inii.geoterra.data.model.remote.UserRemote
import ucr.ac.cr.inii.geoterra.data.repository.AnalysisRequestRepositoryImpl
import ucr.ac.cr.inii.geoterra.data.repository.AuthRepositoryImpl
import ucr.ac.cr.inii.geoterra.data.repository.ManifestationRepositoryImp
import ucr.ac.cr.inii.geoterra.data.repository.UserRepositoryImpl
import ucr.ac.cr.inii.geoterra.domain.pdf.PDFManager
import ucr.ac.cr.inii.geoterra.domain.repository.AnalysisRequestRepository
import ucr.ac.cr.inii.geoterra.domain.repository.AuthRepository
import ucr.ac.cr.inii.geoterra.domain.repository.ManifestationsRepository
import ucr.ac.cr.inii.geoterra.domain.repository.UserRepository
import ucr.ac.cr.inii.geoterra.presentation.auth.AuthViewModel
import ucr.ac.cr.inii.geoterra.presentation.screens.account.AccountViewModel
import ucr.ac.cr.inii.geoterra.presentation.screens.analysisform.AnalysisFormViewModel
import ucr.ac.cr.inii.geoterra.presentation.screens.editProfile.EditProfileViewModel
import ucr.ac.cr.inii.geoterra.presentation.screens.home.HomeViewModel
import ucr.ac.cr.inii.geoterra.presentation.screens.login.LoginViewModel
import ucr.ac.cr.inii.geoterra.presentation.screens.manifestation.ManifestationDetailViewModel
import ucr.ac.cr.inii.geoterra.presentation.screens.map.MapViewModel
import ucr.ac.cr.inii.geoterra.presentation.screens.register.RegisterViewModel
import ucr.ac.cr.inii.geoterra.presentation.screens.request.RequestViewModel

val appModule = module {
  // Tabs ViewModels (ScreenModels)
  single { HomeViewModel() }
  single { MapViewModel(get(), get(), get()) }
  single { AccountViewModel(get(), get()) }
  single { AuthViewModel(get(), get()) }
  single { RequestViewModel(get()) }

  // Inner ViewModels
  factory { ManifestationDetailViewModel(get()) }
  factory { LoginViewModel(get(), get()) }
  factory { RegisterViewModel(get()) }

  factory { params ->
    EditProfileViewModel(
      userProfile = params.get<UserRemote>(),
      get(),
    )
  }

  factory { params ->
    AnalysisFormViewModel(
      get(),
      requestToEdit = params.getOrNull<AnalysisRequestRemote>(),
      get(),
      get(),
    )
  }
  
  // Util modules
  single { Settings() }
  single { PDFManager() }
  
  // Repository implementation
  single<AuthRepository> { AuthRepositoryImpl(get(), get()) }
  single<UserRepository> { UserRepositoryImpl(get()) }
  single<AnalysisRequestRepository> { AnalysisRequestRepositoryImpl(get()) }
  single<ManifestationsRepository> { ManifestationRepositoryImp(get()) }
}