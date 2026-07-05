package ucr.ac.cr.inii.geoterra.presentation.screens.home

import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import cafe.adriel.voyager.core.screen.Screen
import cafe.adriel.voyager.core.screen.ScreenKey
import cafe.adriel.voyager.core.screen.uniqueScreenKey
import cafe.adriel.voyager.navigator.tab.LocalTabNavigator
import org.koin.compose.koinInject
import ucr.ac.cr.inii.geoterra.presentation.navigation.MapTab

/**
 * Voyager Screen implementation for Home.
 */
class HomeScreen : Screen {

  override val key: ScreenKey = uniqueScreenKey


  @Composable
  override fun Content() {
    
    val viewModel: HomeViewModel = koinInject()
    val state by viewModel.state.collectAsState()
    val tabNavigator = LocalTabNavigator.current
    
    HomeContent(
      state = state,
      onCardMapClick = { tabNavigator.current = MapTab }
    )
  }
}