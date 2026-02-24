package ucr.ac.cr.inii.geoterra.presentation

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.ui.Modifier
import cafe.adriel.voyager.core.screen.Screen
import cafe.adriel.voyager.navigator.tab.CurrentTab
import cafe.adriel.voyager.navigator.tab.LocalTabNavigator
import cafe.adriel.voyager.navigator.tab.Tab
import cafe.adriel.voyager.navigator.tab.TabNavigator
import ucr.ac.cr.inii.geoterra.presentation.navigation.AccountTab
import ucr.ac.cr.inii.geoterra.presentation.navigation.HomeTab
import ucr.ac.cr.inii.geoterra.presentation.navigation.MapTab
import ucr.ac.cr.inii.geoterra.presentation.navigation.RequestTab

class MainScreen() : Screen {
  @Composable
  override fun Content() {
    TabNavigator(HomeTab) { tabNavigator ->
      Scaffold(
        bottomBar = {
          NavigationBar {
            TabNavigationItem(HomeTab)
            TabNavigationItem(MapTab)
            TabNavigationItem(RequestTab)
            TabNavigationItem(AccountTab)
          }
        }
      ) { padding ->
        Box(Modifier.padding(padding)) {
          CurrentTab()
        }
      }
    }
  }
  
}

@Composable
private fun RowScope.TabNavigationItem(tab: Tab) {
  val tabNavigator = LocalTabNavigator.current
  NavigationBarItem(
    selected = tabNavigator.current.key == tab.key,
    onClick = { tabNavigator.current = tab },
    label = { Text(tab.options.title) },
    icon = { Icon(painter = tab.options.icon!!, contentDescription = tab.options.title) }
  )
}