package ucr.ac.cr.inii.geoterra

import androidx.compose.runtime.*
import cafe.adriel.voyager.koin.getScreenModel
import cafe.adriel.voyager.navigator.Navigator
import ucr.ac.cr.inii.geoterra.presentation.MainScreen
import ucr.ac.cr.inii.geoterra.presentation.screens.account.AccountViewModel
import ucr.ac.cr.inii.geoterra.themes.GeoterraTheme
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import cafe.adriel.voyager.core.screen.Screen
import cafe.adriel.voyager.koin.getScreenModel
import org.koin.compose.koinInject

/**
 * Root composable for all platforms.
 * Dependency injection MUST be initialized by the platform.
 */
@Composable
fun App() {
  val viewModel = koinInject<AccountViewModel>()
  val state by viewModel.state.collectAsState()

  GeoterraTheme(useDarkTheme = state.isDarkMode) {
    Navigator(screen = MainScreen())
  }
}