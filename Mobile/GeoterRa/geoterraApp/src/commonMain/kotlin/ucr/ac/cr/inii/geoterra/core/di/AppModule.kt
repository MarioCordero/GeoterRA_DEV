package ucr.ac.cr.inii.geoterra.core.di

import com.russhwolf.settings.Settings
import org.koin.dsl.module
import ucr.ac.cr.inii.geoterra.data.model.responses.InvestigationRequestResponse
import ucr.ac.cr.inii.geoterra.data.model.responses.UserResponse
import ucr.ac.cr.inii.geoterra.data.repository.AuthRepository
import ucr.ac.cr.inii.geoterra.data.repository.CantonRepository
import ucr.ac.cr.inii.geoterra.data.repository.DistrictRepository
import ucr.ac.cr.inii.geoterra.data.repository.GeomanifestationsRepository
import ucr.ac.cr.inii.geoterra.data.repository.InvestigationRequestsRepository
import ucr.ac.cr.inii.geoterra.data.repository.ProvinceRepository
import ucr.ac.cr.inii.geoterra.data.repository.UserRepository
import ucr.ac.cr.inii.geoterra.domain.pdf.PDFManager
import ucr.ac.cr.inii.geoterra.domain.repository.AuthRepositoryInterface
import ucr.ac.cr.inii.geoterra.domain.repository.CantonRepositoryInterface
import ucr.ac.cr.inii.geoterra.domain.repository.DistrictRepositoryInterface
import ucr.ac.cr.inii.geoterra.domain.repository.UserRepositoryInterface
import ucr.ac.cr.inii.geoterra.domain.auth.AuthService
import ucr.ac.cr.inii.geoterra.domain.repository.GeomanifestationsRepositoryInterface
import ucr.ac.cr.inii.geoterra.domain.repository.ProvinceRepositoryInterface
import ucr.ac.cr.inii.geoterra.domain.repository.InvestigationRequestsRepositoryInterface
import ucr.ac.cr.inii.geoterra.presentation.screens.account.AccountViewModel
import ucr.ac.cr.inii.geoterra.presentation.screens.investigation.requests.form.InvestigationRequestFormViewModel
import ucr.ac.cr.inii.geoterra.presentation.screens.account.edit.EditAccountViewModel
import ucr.ac.cr.inii.geoterra.presentation.screens.home.HomeViewModel
import ucr.ac.cr.inii.geoterra.presentation.screens.sign.`in`.SignInViewModel
import ucr.ac.cr.inii.geoterra.presentation.screens.map.geomanifestation.GeomanifestationViewModel
import ucr.ac.cr.inii.geoterra.presentation.screens.map.MapViewModel
import ucr.ac.cr.inii.geoterra.presentation.screens.sign.SignUpViewModel
import ucr.ac.cr.inii.geoterra.presentation.screens.investigation.requests.InvestigationRequestsViewModel

val appModule = module {
  // Tabs ViewModels (ScreenModels)
  single { AuthService(get(), get()) }
  single { HomeViewModel() }
  single { MapViewModel(get(), get(), get(), get(), get(), get()) }
  single { AccountViewModel(get(), get()) }
  single { InvestigationRequestsViewModel(get(), get()) }

  // Inner ViewModels
  factory { GeomanifestationViewModel(get()) }
  factory { SignInViewModel(get()) }
  factory { SignUpViewModel(get()) }

  factory { params ->
    EditAccountViewModel(
      userProfile = params.get<UserResponse>(),
      get(),
    )
  }

  factory { params ->
    InvestigationRequestFormViewModel(
      analysisRequestRepository = get(),
      provincesRepository = get(),
      cantonsRepository = get(),
      districtsRepository = get(),
      requestToEdit = params.getOrNull<InvestigationRequestResponse>(),
      locationProvider = get(),
      permissionManager = get()
    )
  }
  
  // Util modules
  single { Settings() }
  single { PDFManager() }
  
  // Repository implementation
  single<AuthRepositoryInterface> { AuthRepository(get(), get()) }
  single<UserRepositoryInterface> { UserRepository(get()) }
  single<ProvinceRepositoryInterface> { ProvinceRepository(get()) }
  single<CantonRepositoryInterface> { CantonRepository(get()) }
  single<DistrictRepositoryInterface> { DistrictRepository(get()) }
  single<InvestigationRequestsRepositoryInterface> { InvestigationRequestsRepository(get()) }
  single<GeomanifestationsRepositoryInterface> { GeomanifestationsRepository(get()) }

  // Provide concrete implementations if needed by other components directly
  single { AuthRepository(get(), get()) }
  single { GeomanifestationsRepository(get()) }
  single { UserRepository(get()) }
  single { ProvinceRepository(get()) }
  single { CantonRepository(get()) }
  single { DistrictRepository(get()) }
  single { InvestigationRequestsRepository(get()) }
}