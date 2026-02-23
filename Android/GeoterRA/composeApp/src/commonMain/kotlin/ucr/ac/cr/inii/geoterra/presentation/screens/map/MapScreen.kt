package ucr.ac.cr.inii.geoterra.presentation.screens.map

import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import cafe.adriel.voyager.core.screen.Screen
import org.koin.compose.koinInject

class MapScreen : Screen {
  
  @Composable
  override fun Content() {
    val viewModel: MapViewModel = koinInject()
    val state by viewModel.state.collectAsState()
    
    MapContent(state = state, onMarkerClick = viewModel::onMarkerSelected)
  }
}