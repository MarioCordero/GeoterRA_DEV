package ucr.ac.cr.inii.geoterra.presentation.components.manifestation

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ElectricBolt
import androidx.compose.material.icons.filled.Newspaper
import androidx.compose.material.icons.filled.Opacity
import androidx.compose.material.icons.filled.Science
import androidx.compose.material.icons.filled.Terrain
import androidx.compose.material.icons.filled.Thermostat
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import ucr.ac.cr.inii.geoterra.data.model.remote.ManifestationRemote
import ucr.ac.cr.inii.geoterra.presentation.components.layout.AdaptiveBackButton
import ucr.ac.cr.inii.geoterra.presentation.components.layout.DataBox
import ucr.ac.cr.inii.geoterra.presentation.components.layout.SectionHeader
import ucr.ac.cr.inii.geoterra.presentation.screens.manifestation.ChemicalGroupCard

@Composable
fun ManifestationReport(
  manifestation: ManifestationRemote,
  isForPdf: Boolean,
  onBack: () -> Unit
) {
  Column(
    modifier = Modifier
      .then(
        if (isForPdf) Modifier.width(380.dp)
        else Modifier.fillMaxSize()
      )
      .padding(16.dp)
  ) {
    Row(
      modifier = Modifier.fillMaxWidth(),
      verticalAlignment = Alignment.CenterVertically,
      horizontalArrangement = Arrangement.Start
    ) {
      Text(
        modifier = Modifier.weight(1f),
        text = manifestation.name,
        style = MaterialTheme.typography.headlineMedium,
        fontWeight = FontWeight.Bold,
        color = MaterialTheme.colorScheme.primary,
      )
      if (!isForPdf) {
        AdaptiveBackButton(onBack = onBack)
      }
    }

    Spacer(modifier = Modifier.height(24.dp))

    // --- SECCIÓN: ENCABEZADO Y ACCIONES ---
//    Text(
//      "Acciones Rápidas",
//      style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
//      color = MaterialTheme.colorScheme.primary,
//      modifier = Modifier.padding(bottom = 12.dp)
//    )
//
//    LazyRow(
//      horizontalArrangement = Arrangement.spacedBy(12.dp),
//      modifier = Modifier.fillMaxWidth()
//    ) {
//      item { ActionCard("Diagrama Piper", Icons.Default.AutoGraph, Color(0xFF2196F3)) { /* Ver Gráfico */ } }
//      item { ActionCard("Descargar PDF", Icons.Default.Download, Color(0xFF4CAF50)) { onDownload() } }
//      item { ActionCard("Historial", Icons.Default.History, Color(0xFF9C27B0)) { /* Ver Logs */ } }
//    }
//
//    Spacer(modifier = Modifier.height(24.dp))

    // Field parameters section
    SectionHeader("Parámetros de Campo", Icons.Default.Terrain)
    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
      DataBox(
        Modifier.weight(1f), "Temperatura",
        "${manifestation.temperature ?: "--"}°C",
        Icons.Default.Thermostat, Color(0xFFFF5722)
      )
      DataBox(
        Modifier.weight(1f), "pH",
        "${manifestation.field_pH ?: "--"}",
        Icons.Default.Opacity, Color(0xFF2196F3)
      )
    }
    Spacer(modifier = Modifier.height(8.dp))
    DataBox(
      Modifier.fillMaxWidth(), "Conductividad Eléctrica",
      "${manifestation.field_conductivity ?: "--"} µS/cm",
      Icons.Default.ElectricBolt, Color(0xFF4CAF50)
    )

    Spacer(modifier = Modifier.height(24.dp))

    SectionHeader("Parámetros de Laboratorio", Icons.Default.Science)
    DataBox(
      Modifier.fillMaxWidth(), "pH",
      "${manifestation.field_pH ?: "--"}",
      Icons.Default.Opacity, Color(0xFF2196F3)
    )
    Spacer(modifier = Modifier.height(8.dp))
    DataBox(
      Modifier.fillMaxWidth(), "Conductividad Eléctrica",
      "${manifestation.field_conductivity ?: "--"} µS/cm",
      Icons.Default.ElectricBolt, Color(0xFF4CAF50)
    )

    Spacer(modifier = Modifier.height(24.dp))

    // Lab Analysis section
    SectionHeader("Análisis de Laboratorio", Icons.Default.Newspaper)

    // Cations
    ChemicalGroupCard(
      title = "Cationes Principales",
      color = Color(0xFFE91E63),
      elements = listOf(
        "Sodio (Na)" to manifestation.na,
        "Potasio (K)" to manifestation.k,
        "Calcio (Ca)" to manifestation.ca,
        "Magnesio (Mg)" to manifestation.mg,
        "Hierro (Fe)" to manifestation.fe,
        "Litio (Li)" to manifestation.li
      )
    )

    Spacer(modifier = Modifier.height(12.dp))

    // Anions
    ChemicalGroupCard(
      title = "Aniones y Otros",
      color = Color(0xFF00BCD4),
      elements = listOf(
        "Cloro (Cl)" to manifestation.cl,
        "Sulfatos (SO4)" to manifestation.so4,
        "Bicarbonato (HCO3)" to manifestation.hco3,
        "Flúor (F)" to manifestation.f,
        "Boro (B)" to manifestation.b,
        "Sílice (SiO2)" to manifestation.si
      )
    )

    if (isForPdf) {
      Spacer(modifier = Modifier.height(8.dp))
      Text(
        modifier = Modifier.align(Alignment.CenterHorizontally),
        text ="© 2021 Instituto de Investigaciones en Ingeniería - UCR",
        style = MaterialTheme.typography.labelSmall,
        color = Color.Gray
      )
    }

    Spacer(modifier = Modifier.height(20.dp))
  }
}