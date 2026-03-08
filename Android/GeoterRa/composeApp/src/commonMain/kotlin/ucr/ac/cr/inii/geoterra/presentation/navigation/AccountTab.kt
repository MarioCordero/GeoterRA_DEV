package ucr.ac.cr.inii.geoterra.presentation.navigation

import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import cafe.adriel.voyager.navigator.tab.Tab
import cafe.adriel.voyager.navigator.tab.TabOptions
import geoterra.composeapp.generated.resources.Res
import geoterra.composeapp.generated.resources.ic_account
import org.jetbrains.compose.resources.painterResource
import org.koin.compose.koinInject
import androidx.compose.runtime.getValue
import androidx.compose.runtime.key
import cafe.adriel.voyager.navigator.Navigator
import ucr.ac.cr.inii.geoterra.presentation.auth.AuthService
import ucr.ac.cr.inii.geoterra.presentation.screens.account.AccountScreen
import ucr.ac.cr.inii.geoterra.presentation.screens.login.LoginScreen

object AccountTab : Tab {
  override val key: String = "AccountScreen_${hashCode()}"

  @Composable
  override fun Content() {
    val authService = koinInject<AuthService>()
    val isLoggedIn by authService.isLoggedIn.collectAsState()

    key(isLoggedIn) {
      val rootScreen = if (isLoggedIn == true) {
        AccountScreen()
      } else {
        LoginScreen()
      }

      Navigator(rootScreen)
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