package ucr.ac.cr.inii.geoterra.presentation.screens.map

import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import cafe.adriel.voyager.core.screen.Screen
import cafe.adriel.voyager.navigator.LocalNavigator
import cafe.adriel.voyager.navigator.currentOrThrow
import org.koin.compose.koinInject
import ucr.ac.cr.inii.geoterra.presentation.screens.analysisform.AnalysisFormScreen
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

    Scaffold(
      floatingActionButton = {
        FloatingActionButton(
          onClick = { navigator.push(AnalysisFormScreen()) },
          containerColor = MaterialTheme.colorScheme.primary,
          contentColor = MaterialTheme.colorScheme.onPrimary
        ) {
          Icon(Icons.Default.Add, contentDescription = "Crear")
        }
      }
    ) { padding ->
      MapContent(
        modifier = Modifier.padding(padding),
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
}