package ucr.ac.cr.inii.geoterra.presentation.navigation

import androidx.compose.animation.Crossfade
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import cafe.adriel.voyager.navigator.tab.Tab
import cafe.adriel.voyager.navigator.tab.TabOptions
import geoterra.composeapp.generated.resources.Res
import geoterra.composeapp.generated.resources.ic_account
import org.jetbrains.compose.resources.painterResource
import org.koin.compose.koinInject
import androidx.compose.runtime.getValue
import cafe.adriel.voyager.navigator.Navigator
import ucr.ac.cr.inii.geoterra.presentation.auth.AuthViewModel
import ucr.ac.cr.inii.geoterra.presentation.screens.account.AccountContent
import ucr.ac.cr.inii.geoterra.presentation.screens.account.AccountScreen
import ucr.ac.cr.inii.geoterra.presentation.screens.account.AccountViewModel
import ucr.ac.cr.inii.geoterra.presentation.screens.login.LoginContent
import ucr.ac.cr.inii.geoterra.presentation.screens.login.LoginScreen
import ucr.ac.cr.inii.geoterra.presentation.screens.login.LoginViewModel
import ucr.ac.cr.inii.geoterra.presentation.screens.map.MapScreen

object AccountTab : Tab {

  @Composable
  override fun Content() {
    val authViewModel = koinInject<AuthViewModel>()
    val isLoggedIn by authViewModel.isLoggedIn.collectAsState()

    val rootScreen = if (isLoggedIn == true) {
      AccountScreen()
    } else {
      LoginScreen()
    }

    Crossfade(targetState = rootScreen) { screen ->
      Navigator(screen)
    }
  }
  
  override val options: TabOptions
    @Composable
    get() = TabOptions(
      index = 3u,
      title = "Cuenta",
      icon = painterResource(Res.drawable.ic_account)
    )
}