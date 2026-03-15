package ucr.ac.cr.inii.geoterra.presentation.screens.map

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.FilterList
import androidx.compose.material.icons.filled.MyLocation
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import cafe.adriel.voyager.core.screen.Screen
import cafe.adriel.voyager.core.screen.ScreenKey
import cafe.adriel.voyager.core.screen.uniqueScreenKey
import cafe.adriel.voyager.koin.getScreenModel
import cafe.adriel.voyager.navigator.LocalNavigator
import cafe.adriel.voyager.navigator.currentOrThrow
import org.koin.compose.koinInject
import ucr.ac.cr.inii.geoterra.presentation.components.map.FilterBottomModal
import ucr.ac.cr.inii.geoterra.presentation.screens.analysisform.AnalysisFormScreen
import ucr.ac.cr.inii.geoterra.presentation.screens.manifestation.ManifestationDetailScreen

class MapScreen(
) : Screen {
  override val key: ScreenKey = uniqueScreenKey


  @OptIn(ExperimentalMaterial3Api::class)
  @Composable
  override fun Content() {
    val viewModel = getScreenModel<MapViewModel>()
    val state by viewModel.state.collectAsState()
    val navigator = LocalNavigator.currentOrThrow

    val snackBarHost = remember { SnackbarHostState() }
    
    LaunchedEffect(Unit) {
      viewModel.requestLocationIfNeeded()
      viewModel.loadMapMarkers(state.selectedRegionId)
    }

    Scaffold(
      snackbarHost = { SnackbarHost(snackBarHost) },
      floatingActionButton = {
        Column(
          horizontalAlignment = Alignment.End,
          verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {

          FloatingActionButton(
            onClick = { viewModel.onUserMarkerSelected() },
            containerColor = MaterialTheme.colorScheme.primary,
            contentColor = MaterialTheme.colorScheme.onPrimary
          ) {
            Icon(Icons.Default.MyLocation, contentDescription = "Mi ubicación")
          }

          FloatingActionButton(
            onClick = { viewModel.toggleFilterModal() },
            containerColor = MaterialTheme.colorScheme.secondary,
            contentColor = MaterialTheme.colorScheme.onSecondary,
            modifier = Modifier.size(56.dp)
          ) {
            Icon(Icons.Default.FilterList, contentDescription = "Filtros")
          }
        }

      }
    ) { padding ->
      MapContent(
        modifier = Modifier.fillMaxSize(),
        state = state,
        onManifestationMarkerClick = viewModel::onManifestationMarkerSelected,
        onUserMarkerClick = viewModel::onUserMarkerSelected,
        onDismissPanel = { viewModel.onManifestationMarkerSelected("") },
        onDetailsClick = { manifestation ->
          navigator.push(ManifestationDetailScreen(manifestation))
        }
      )

      FilterBottomModal(
        isVisible = state.isFilterModalVisible,
        state = state,
        onRegionSelected = viewModel::toggleRegion,
        onLayerSelected = viewModel::selectLayer,
        onClearSelectedRegion = viewModel::clearSelectedRegion,
        onDismiss = viewModel::hideFilterModal,
        onApplyFilters = viewModel::applyFilters
      )
    }
  }
}