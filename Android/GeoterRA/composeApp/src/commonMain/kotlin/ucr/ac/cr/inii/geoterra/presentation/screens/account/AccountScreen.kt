package ucr.ac.cr.inii.geoterra.presentation.screens.account

import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import cafe.adriel.voyager.core.screen.Screen
import org.koin.compose.koinInject

/**
 * Voyager Screen implementation for Home.
 */
class AccountScreen : Screen {
  
  @Composable
  override fun Content() {
    
    val accountViewModel = koinInject<AccountViewModel>()
    val accountState by accountViewModel.state.collectAsState()
    AccountContent(
      state = accountState,
      onLogoutClick = {
        accountViewModel.logout()
      },
      onDeleteAccountClick = {
        // Aquí podrías llamar a accountViewModel.deleteAccount()
//        accountViewModel.deleteAccount()
      },
      onEditClick = {
        // Navegar a pantalla de edición: navigator.push(EditProfileScreen())
      },
      onRefresh = accountViewModel::loadUserProfile
    )
  }
}