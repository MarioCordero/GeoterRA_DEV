package ucr.ac.cr.inii.geoterra.presentation.screens.account

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import cafe.adriel.voyager.core.screen.Screen
import cafe.adriel.voyager.core.screen.ScreenKey
import cafe.adriel.voyager.core.screen.uniqueScreenKey
import cafe.adriel.voyager.koin.getScreenModel
import cafe.adriel.voyager.navigator.LocalNavigator
import cafe.adriel.voyager.navigator.currentOrThrow
import ucr.ac.cr.inii.geoterra.presentation.screens.editProfile.EditProfileScreen

/**
 * Voyager Screen implementation for Home.
 */
class AccountScreen : Screen {

  override val key: ScreenKey = uniqueScreenKey

  @Composable
  override fun Content() {
    
    val viewModel = getScreenModel<AccountViewModel>()
    val state by viewModel.state.collectAsState()
    val navigator = LocalNavigator.currentOrThrow

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
        modifier = Modifier.padding(top = paddingValues.calculateTopPadding()),
        state = state,
        onLogoutClick = {
          viewModel.logout()
        },
        onDeleteAccountClick = {
          viewModel.deleteAccount()
          navigator.pop()
        },
        onEditClick = {
          navigator.push(EditProfileScreen(userProfile = state.user!!))
        },
        onThemeToggle = { isDark ->
          viewModel.toggleTheme(isDark)
        },
        clearError = { viewModel.clearError() }
      )
    }
  }
}