package ucr.ac.cr.inii.geoterra.presentation.screens.manifestation

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoGraph
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.ElectricBolt
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.Newspaper
import androidx.compose.material.icons.filled.Opacity
import androidx.compose.material.icons.filled.Science
import androidx.compose.material.icons.filled.Terrain
import androidx.compose.material.icons.filled.Thermostat
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import ucr.ac.cr.inii.geoterra.data.model.remote.ManifestationRemote
import ucr.ac.cr.inii.geoterra.presentation.components.layout.DataBox
import ucr.ac.cr.inii.geoterra.presentation.components.layout.SectionHeader
import ucr.ac.cr.inii.geoterra.presentation.components.layout.ActionCard
import ucr.ac.cr.inii.geoterra.presentation.components.layout.AdaptiveBackButton
import ucr.ac.cr.inii.geoterra.presentation.components.manifestation.ChemicalRow
import ucr.ac.cr.inii.geoterra.presentation.components.manifestation.ManifestationReport
import ucr.ac.cr.inii.geoterra.presentation.screens.analysisform.AnalysisFormEvent

@Composable
fun ManifestationDetailContent(
  modifier: Modifier,
  state : ManifestationDetailState,
  manifestation: ManifestationRemote,
  onDownload: () -> Unit,
  onBack: () -> Unit
) {
  Column(
    modifier = modifier
      .fillMaxSize()
      .verticalScroll(rememberScrollState())
  ) {

    ManifestationReport(
      manifestation = manifestation,
      isForPdf = false,
      onBack = onBack
    )

    Spacer(modifier = Modifier.height(24.dp))

    Button(
      onClick = { onDownload() },
      modifier = Modifier
        .fillMaxWidth()
        .height(58.dp),
      shape = RoundedCornerShape(16.dp),
      colors = ButtonDefaults.buttonColors(
        containerColor = MaterialTheme.colorScheme.primary,
        contentColor = MaterialTheme.colorScheme.onPrimary
      ),
      elevation = ButtonDefaults.buttonElevation(
        defaultElevation = 4.dp,
        pressedElevation = 0.dp
      ),
      enabled = !state.isLoading
    ) {
      if (state.isLoading) {
        CircularProgressIndicator(modifier = Modifier.size(24.dp), color = Color.White)
      } else {
        Text("Descargar Reporte", fontWeight = FontWeight.Bold, letterSpacing = 1.2.sp)
      }
    }

    Spacer(modifier = Modifier.height(32.dp))
  }
}

@Composable
fun ChemicalGroupCard(
  title: String,
  color: Color,
  elements: List<Pair<String, Float?>>
) {
  Card(
    modifier = Modifier.fillMaxWidth(),
    shape = RoundedCornerShape(24.dp),
    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
    border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f))
  ) {
    Column(modifier = Modifier.padding(16.dp)) {
      Text(
        text = title,
        style = MaterialTheme.typography.titleMedium,
        fontWeight = FontWeight.Bold,
        color = color
      )
      Spacer(modifier = Modifier.height(12.dp))
      
      elements.forEach { (label, value) ->
        ChemicalRow(label, value)
      }
    }
  }
}
