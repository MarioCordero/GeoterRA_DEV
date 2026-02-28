package ucr.ac.cr.inii.geoterra.presentation.navigation

import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.togetherWith
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import cafe.adriel.voyager.navigator.Navigator
import cafe.adriel.voyager.navigator.tab.Tab
import cafe.adriel.voyager.navigator.tab.TabOptions
import cafe.adriel.voyager.transitions.FadeTransition
import cafe.adriel.voyager.transitions.ScreenTransition
import cafe.adriel.voyager.transitions.SlideTransition
import geoterra.composeapp.generated.resources.Res
import geoterra.composeapp.generated.resources.ic_contract
import org.jetbrains.compose.resources.painterResource
import ucr.ac.cr.inii.geoterra.presentation.screens.request.RequestsScreen

internal object RequestTab : Tab {
  override val options: TabOptions
    @Composable
    get() {
      val icon = painterResource(Res.drawable.ic_contract)
      return TabOptions(index = 0u, title = "Solicitudes", icon)
    }
  
  @Composable
  override fun Content() {
    Navigator(RequestsScreen())
  }
}