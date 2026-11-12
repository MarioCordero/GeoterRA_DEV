package ucr.ac.cr.inii.geoterra.presentation.navigation

import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import cafe.adriel.voyager.navigator.Navigator
import cafe.adriel.voyager.navigator.tab.Tab
import cafe.adriel.voyager.navigator.tab.TabOptions
import cafe.adriel.voyager.transitions.SlideTransition
import geoterra.geoterraapp.generated.resources.Res
import geoterra.geoterraapp.generated.resources.ic_account
import org.jetbrains.compose.resources.painterResource
import org.koin.compose.koinInject
import ucr.ac.cr.inii.geoterra.domain.auth.AuthService
import ucr.ac.cr.inii.geoterra.presentation.screens.account.AccountScreen
import ucr.ac.cr.inii.geoterra.presentation.screens.sign.`in`.SignInScreen

object AccountTab : Tab {
  override val key: String = "AccountTab"

  @Composable
  override fun Content() {
    val authService = koinInject<AuthService>()
    val isLoggedIn by authService.isLoggedIn.collectAsState()

    val rootScreen = remember(isLoggedIn) {
      if (isLoggedIn == true) {
        AccountScreen()
      } else {
        SignInScreen()
      }
    }

    Navigator(rootScreen) { navigator ->
      SlideTransition(navigator) { screen ->
        screen.Content()
      }
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