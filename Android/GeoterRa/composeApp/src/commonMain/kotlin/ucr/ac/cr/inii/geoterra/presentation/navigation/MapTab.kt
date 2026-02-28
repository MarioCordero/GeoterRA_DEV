package ucr.ac.cr.inii.geoterra.presentation.navigation

import androidx.compose.runtime.Composable
import cafe.adriel.voyager.navigator.Navigator
import cafe.adriel.voyager.navigator.tab.Tab
import cafe.adriel.voyager.navigator.tab.TabOptions
import geoterra.composeapp.generated.resources.Res
import geoterra.composeapp.generated.resources.ic_map
import org.jetbrains.compose.resources.painterResource
import ucr.ac.cr.inii.geoterra.presentation.screens.map.MapScreen

internal object MapTab : Tab {
  override val options: TabOptions
    @Composable
    get() {
      val icon = painterResource(Res.drawable.ic_map)
      return TabOptions(index = 0u, title = "Mapa", icon)
    }
  
  
  @Composable
  override fun Content() {
    Navigator(MapScreen())
  }
}