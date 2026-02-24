package ucr.ac.cr.inii.geoterra.presentation.screens.manifestation

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import cafe.adriel.voyager.core.screen.Screen
import cafe.adriel.voyager.navigator.LocalNavigator
import org.koin.compose.koinInject
import org.koin.core.parameter.parametersOf
import ucr.ac.cr.inii.geoterra.data.model.remote.ManifestationRemote

class ManifestationDetailScreen(val manifestation: ManifestationRemote) : Screen {
  @OptIn(ExperimentalMaterial3Api::class)
  @Composable
  override fun Content() {
    val viewModel: ManifestationDetailViewModel = koinInject { parametersOf(manifestation) }
    val state by viewModel.state.collectAsState()
    
    ManifestationDetailContent(
      modifier = Modifier.padding(16.dp),
      manifestation = state.manifestation!!,
      onDownload = viewModel::downloadReport
    )
  }
}