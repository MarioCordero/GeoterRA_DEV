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
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoGraph
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.ElectricBolt
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.Opacity
import androidx.compose.material.icons.filled.Science
import androidx.compose.material.icons.filled.Thermostat
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import ucr.ac.cr.inii.geoterra.data.model.remote.ManifestationRemote

@Composable
fun ManifestationDetailContent(
  modifier: Modifier,
  manifestation: ManifestationRemote,
  onDownload: () -> Unit
) {
  Column(
    modifier = modifier
      .fillMaxSize()
      .verticalScroll(rememberScrollState())
      .padding(16.dp)
  ) {
    Text("Acciones Rápidas", style = MaterialTheme.typography.titleMedium, modifier = Modifier.padding(bottom = 12.dp))
    LazyRow(
      horizontalArrangement = Arrangement.spacedBy(12.dp),
      modifier = Modifier.fillMaxWidth()
    ) {
      item { ActionCard("Análisis", Icons.Default.Science, Color(0xFFFF5722)) { /* Navegar a Análisis */ } }
      item { ActionCard("Piper", Icons.Default.AutoGraph, Color(0xFF2196F3)) { /* Ver Gráfico */ } }
      item { ActionCard("Descargar", Icons.Default.Download, Color(0xFF4CAF50)) { onDownload() } }
      item { ActionCard("Historial", Icons.Default.History, Color(0xFF9C27B0)) { /* Ver Logs */ } }
    }
    
    Spacer(modifier = Modifier.height(24.dp))
    
    // --- 2. GRID DE DATOS FÍSICOS ---
    Text("Parámetros de Campo", style = MaterialTheme.typography.titleMedium)
    Spacer(modifier = Modifier.height(8.dp))
    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
      DataBox(Modifier.weight(1f), "Temperatura", "${manifestation.temperature}°C", Icons.Default.Thermostat, Color(0xFFFF5722))
      DataBox(Modifier.weight(1f), "pH Campo", "${manifestation.field_pH}", Icons.Default.Opacity, Color(0xFF2196F3))
    }
    Spacer(modifier = Modifier.height(8.dp))
    DataBox(Modifier.fillMaxWidth(), "Conductividad", "${manifestation.field_conductivity} µS/cm", Icons.Default.ElectricBolt, Color(0xFF4CAF50))
    
    Spacer(modifier = Modifier.height(24.dp))
    
    // --- 3. TABLA DE COMPOSICIÓN QUÍMICA ---
    Card(
      modifier = Modifier.fillMaxWidth(),
      shape = RoundedCornerShape(16.dp),
      colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f))
    ) {
      Column(modifier = Modifier.padding(16.dp)) {
        Text("Composición Química (Laboratorio)", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
        Spacer(modifier = Modifier.height(12.dp))
        ChemicalRow("Cloro (Cl)", manifestation.cl)
        ChemicalRow("Sodio (Na)", manifestation.na)
        ChemicalRow("Sustancias (SO4)", manifestation.so4)
        ChemicalRow("Magnesio (Mg)", manifestation.mg)
        ChemicalRow("Calcio (Ca)", manifestation.ca)
      }
    }
    
    Spacer(modifier = Modifier.height(24.dp))
  }
}

@Composable
fun ActionCard(label: String, icon: ImageVector, color: Color, onClick: () -> Unit) {
  Card(
    onClick = onClick,
    modifier = Modifier.size(width = 110.dp, height = 120.dp),
    shape = RoundedCornerShape(20.dp),
    colors = CardDefaults.cardColors(containerColor = color.copy(alpha = 0.15f))
  ) {
    Column(
      modifier = Modifier.fillMaxSize(),
      verticalArrangement = Arrangement.Center,
      horizontalAlignment = Alignment.CenterHorizontally
    ) {
      Icon(icon, contentDescription = null, tint = color, modifier = Modifier.size(32.dp))
      Spacer(modifier = Modifier.height(8.dp))
      Text(label, style = MaterialTheme.typography.labelMedium, fontWeight = FontWeight.Bold, color = color)
    }
  }
}

@Composable
fun DataBox(modifier: Modifier, label: String, value: String, icon: ImageVector, color: Color) {
  Surface(
    modifier = modifier,
    shape = RoundedCornerShape(16.dp),
    color = MaterialTheme.colorScheme.surface,
    border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant)
  ) {
    Row(modifier = Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
      Icon(icon, contentDescription = null, tint = color, modifier = Modifier.size(24.dp))
      Spacer(modifier = Modifier.width(12.dp))
      Column {
        Text(label, style = MaterialTheme.typography.labelSmall, color = Color.Gray)
        Text(value, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Black)
      }
    }
  }
}

@Composable
fun ChemicalRow(label: String, value: Float?) {
  Row(
    modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
    horizontalArrangement = Arrangement.SpaceBetween
  ) {
    Text(label, style = MaterialTheme.typography.bodyMedium)
    Text(value?.toString() ?: "N/D", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurface)
  }
  HorizontalDivider(thickness = 0.5.dp, color = MaterialTheme.colorScheme.outlineVariant)
}