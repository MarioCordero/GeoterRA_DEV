package ucr.ac.cr.inii.geoterra.presentation.screens.map

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import cafe.adriel.voyager.core.screen.Screen
import cafe.adriel.voyager.navigator.LocalNavigator
import cafe.adriel.voyager.navigator.currentOrThrow
import org.koin.compose.koinInject
import ucr.ac.cr.inii.geoterra.presentation.screens.manifestation.ManifestationDetailScreen

class MapScreen(
) : Screen {
  
  @Composable
  override fun Content() {
    val viewModel: MapViewModel = koinInject()
    val state by viewModel.state.collectAsState()
    val navigator = LocalNavigator.currentOrThrow
    
    LaunchedEffect(Unit) {
      viewModel.requestLocationIfNeeded()
    }
    
    MapContent(
      state = state,
      onManifestationMarkerClick = viewModel::onManifestationMarkerSelected,
      onUserMarkerClick = viewModel::onUserMarkerSelected,
      onDismissPanel = { viewModel.onManifestationMarkerSelected("") },
      onDetailsClick = { manifestation ->
        navigator.push(ManifestationDetailScreen(manifestation))
      }
    )

  }
}