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
import androidx.compose.material.icons.filled.Newspaper
import androidx.compose.material.icons.filled.Opacity
import androidx.compose.material.icons.filled.Science
import androidx.compose.material.icons.filled.Terrain
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
import androidx.compose.ui.unit.sp
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
    // --- SECCIÓN: ENCABEZADO Y ACCIONES ---
    Text(
      "Acciones Rápidas",
      style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
      color = MaterialTheme.colorScheme.primary,
      modifier = Modifier.padding(bottom = 12.dp)
    )
    LazyRow(
      horizontalArrangement = Arrangement.spacedBy(12.dp),
      modifier = Modifier.fillMaxWidth()
    ) {
      item { ActionCard("Diagrama Piper", Icons.Default.AutoGraph, Color(0xFF2196F3)) { /* Ver Gráfico */ } }
      item { ActionCard("Descargar PDF", Icons.Default.Download, Color(0xFF4CAF50)) { onDownload() } }
      item { ActionCard("Historial", Icons.Default.History, Color(0xFF9C27B0)) { /* Ver Logs */ } }
    }
    
    Spacer(modifier = Modifier.height(24.dp))
    
    // Field parameters section
    SectionHeader("Parámetros de Campo", Icons.Default.Terrain)
    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
      DataBox(Modifier.weight(1f), "Temperatura", "${manifestation.temperature ?: "--"}°C", Icons.Default.Thermostat, Color(0xFFFF5722))
      DataBox(Modifier.weight(1f), "pH Campo", "${manifestation.field_pH ?: "--"}", Icons.Default.Opacity, Color(0xFF2196F3))
    }
    Spacer(modifier = Modifier.height(8.dp))
    DataBox(Modifier.fillMaxWidth(), "Conductividad Eléctrica", "${manifestation.field_conductivity ?: "--"} µS/cm", Icons.Default.ElectricBolt, Color(0xFF4CAF50))
    
    Spacer(modifier = Modifier.height(24.dp))
    
    SectionHeader("Parámetros de Laboratorio", Icons.Default.Science)
    DataBox(Modifier.fillMaxWidth(), "pH", "${manifestation.field_pH ?: "--"}", Icons.Default.Opacity, Color(0xFF2196F3))
    Spacer(modifier = Modifier.height(8.dp))
    DataBox(Modifier.fillMaxWidth(), "Conductividad Eléctrica", "${manifestation.field_conductivity ?: "--"} µS/cm", Icons.Default.ElectricBolt, Color(0xFF4CAF50))
    
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
    
    Spacer(modifier = Modifier.height(32.dp))
  }
}

@Composable
fun SectionHeader(title: String, icon: ImageVector) {
  Row(
    verticalAlignment = Alignment.CenterVertically,
    modifier = Modifier.padding(bottom = 12.dp)
  ) {
    Icon(icon, contentDescription = null, modifier = Modifier.size(18.dp), tint = MaterialTheme.colorScheme.primary)
    Spacer(Modifier.width(8.dp))
    Text(
      text = title.uppercase(),
      style = MaterialTheme.typography.labelLarge.copy(letterSpacing = 1.2.sp),
      fontWeight = FontWeight.Bold,
      color = MaterialTheme.colorScheme.onSurfaceVariant
    )
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
    modifier = Modifier
      .fillMaxWidth()
      .padding(vertical = 8.dp),
    horizontalArrangement = Arrangement.SpaceBetween,
    verticalAlignment = Alignment.CenterVertically
  ) {
    Text(
      label,
      style = MaterialTheme.typography.bodyMedium,
      color = MaterialTheme.colorScheme.onSurfaceVariant
    )
    Text(
      text = if (value != null) "$value mg/L" else "N/D",
      style = MaterialTheme.typography.bodyLarge.copy(
        fontWeight = FontWeight.SemiBold,
        fontFeatureSettings = "tnum" // Fuentes monoespaciadas para números
      ),
      color = if (value != null) MaterialTheme.colorScheme.onSurface else MaterialTheme.colorScheme.outline
    )
  }
  HorizontalDivider(thickness = 0.5.dp, color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f))
}