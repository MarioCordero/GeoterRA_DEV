package ucr.ac.cr.inii.geoterra.core.di

import com.russhwolf.settings.Settings
import org.koin.dsl.module
import ucr.ac.cr.inii.geoterra.data.model.remote.AnalysisRequestRemote
import ucr.ac.cr.inii.geoterra.data.model.remote.UserRemote
import ucr.ac.cr.inii.geoterra.data.repository.AnalysisRequestRepository
import ucr.ac.cr.inii.geoterra.data.repository.AuthRepository
import ucr.ac.cr.inii.geoterra.data.repository.ManifestationRepository
import ucr.ac.cr.inii.geoterra.data.repository.RegionRepository
import ucr.ac.cr.inii.geoterra.data.repository.UserRepository
import ucr.ac.cr.inii.geoterra.domain.pdf.PDFManager
import ucr.ac.cr.inii.geoterra.domain.repository.AnalysisRequestRepositoryInterface
import ucr.ac.cr.inii.geoterra.domain.repository.AuthRepositoryInterface
import ucr.ac.cr.inii.geoterra.domain.repository.ManifestationsRepositoryInterface
import ucr.ac.cr.inii.geoterra.domain.repository.RegionRepositoryInterface
import ucr.ac.cr.inii.geoterra.domain.repository.UserRepositoryInterface
import ucr.ac.cr.inii.geoterra.domain.auth.AuthService
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
  single { AuthService(get(), get()) }
  single { HomeViewModel() }
  single { MapViewModel(get(), get(), get()) }
  single { AccountViewModel(get(), get()) }
  single { RequestViewModel(get(), get()) }

  // Inner ViewModels
  factory { ManifestationDetailViewModel(get()) }
  factory { LoginViewModel(get()) }
  factory { RegisterViewModel(get()) }

  factory { params ->
    EditProfileViewModel(
      userProfile = params.get<UserRemote>(),
      get(),
    )
  }

  factory { params ->
    AnalysisFormViewModel(
      get(), get(),
      requestToEdit = params.getOrNull<AnalysisRequestRemote>(),
      get(),
      get(),
    )
  }
  
  // Util modules
  single { Settings() }
  single { PDFManager() }
  
  // Repository implementation
  single<AuthRepositoryInterface> { AuthRepository(get(), get()) }
  single<UserRepositoryInterface> { UserRepository(get()) }
  single<RegionRepositoryInterface> { RegionRepository(get()) }
  single<AnalysisRequestRepositoryInterface> { AnalysisRequestRepository(get()) }
  single<ManifestationsRepositoryInterface> { ManifestationRepository(get()) }

  single { AuthRepository(get(), get())}
  single { ManifestationRepository(get()) }
  single { UserRepository(get()) }
  single { RegionRepository(get()) }
  single { AnalysisRequestRepository(get()) }
}