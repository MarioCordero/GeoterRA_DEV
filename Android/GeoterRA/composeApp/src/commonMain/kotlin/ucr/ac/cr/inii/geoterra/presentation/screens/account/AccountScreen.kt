package ucr.ac.cr.inii.geoterra.presentation.screens.account

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
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

    Scaffold(
      topBar = {
        Column(modifier = Modifier.padding(horizontal = 20.dp, vertical = 10.dp)) {
          Text(
            text = "Cuenta",
            style = MaterialTheme.typography.headlineMedium,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.secondary
          )
        }
      }
    ) { paddingValues ->
      AccountContent(
        modifier = Modifier.padding(paddingValues),
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
}