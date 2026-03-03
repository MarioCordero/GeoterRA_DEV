package ucr.ac.cr.inii.geoterra.presentation.screens.manifestation

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import cafe.adriel.voyager.core.screen.Screen
import cafe.adriel.voyager.koin.getScreenModel
import cafe.adriel.voyager.navigator.LocalNavigator
import cafe.adriel.voyager.navigator.currentOrThrow
import org.koin.compose.koinInject
import org.koin.core.parameter.parametersOf
import org.koin.core.qualifier.Qualifier
import ucr.ac.cr.inii.geoterra.data.model.remote.ManifestationRemote
import ucr.ac.cr.inii.geoterra.presentation.components.layout.AdaptiveBackButton
import ucr.ac.cr.inii.geoterra.presentation.screens.analysisform.AnalysisFormViewModel
import ucr.ac.cr.inii.geoterra.presentation.screens.map.MapViewModel

class ManifestationDetailScreen(val manifestation: ManifestationRemote) : Screen {
  @OptIn(ExperimentalMaterial3Api::class)
  @Composable
  override fun Content() {
    val viewModel = getScreenModel<ManifestationDetailViewModel>(
      parameters = { parametersOf(manifestation) }
    )
    val state by viewModel.state.collectAsState()
    val navigator = LocalNavigator.currentOrThrow

    Scaffold(
      topBar = {
        Row(
          modifier = Modifier.padding(horizontal = 20.dp, vertical = 10.dp),
          verticalAlignment = Alignment.CenterVertically,
          horizontalArrangement = Arrangement.Start
        ) {
          AdaptiveBackButton(onBack = {navigator.pop()})
          Text(
            text = manifestation.name,
            style = MaterialTheme.typography.headlineLarge,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.primary
          )
        }
      }
    ) { paddingValues ->
      ManifestationDetailContent(
        modifier = Modifier.padding(paddingValues),
        manifestation = state.manifestation!!,
        onDownload = viewModel::downloadReport,
        onBack = navigator::pop
      )
    }
  }
}