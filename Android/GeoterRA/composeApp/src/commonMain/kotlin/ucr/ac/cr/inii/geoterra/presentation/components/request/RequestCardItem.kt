package ucr.ac.cr.inii.geoterra.presentation.components.request

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import ucr.ac.cr.inii.geoterra.data.model.remote.AnalysisRequestRemote

@Composable
fun RequestCardItem(
  request: AnalysisRequestRemote,
  onView: () -> Unit,
  onEdit: () -> Unit,
  onDelete: () -> Unit
) {
  Card(
    modifier = Modifier.fillMaxWidth(),
    shape = RoundedCornerShape(16.dp),
    elevation = CardDefaults.cardElevation(4.dp),
    colors = CardDefaults.cardColors(containerColor = Color.White)
  ) {
    Column(modifier = Modifier.padding(16.dp)) {
      // Header con ID y Nombre
      Row(verticalAlignment = Alignment.CenterVertically) {
        Column(modifier = Modifier.weight(1f)) {
          Text(
            text = request.name,
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold,
            color = Color(0xFF1A237E)
          )
//                    Text("ID: ${request.id}", style = MaterialTheme.typography.labelSmall, color = Color.Gray)
        }
        StatusBadge("Pendiente") // Estado mockeado ya que no está en el remote actual
      }
      
      HorizontalDivider(Modifier.padding(vertical = 12.dp), thickness = 0.5.dp)
      
      // Grid de Datos Técnicos
      Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        RequestInfoRow(
          label1 = "Región", value1 = request.region,
          label2 = "Uso", value2 = request.current_usage ?: "N/A"
        )
        RequestInfoRow(
          label1 = "Latitud", value1 = request.latitude.toString(),
          label2 = "Longitud", value2 = request.longitude.toString()
        )
      }
      
      // Acciones
      Row(
        modifier = Modifier.fillMaxWidth().padding(top = 16.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
      ) {
        SecondaryButton(text = "Ver", onClick = onView, modifier = Modifier.weight(1f))
        SecondaryButton(text = "Editar", onClick = onEdit, modifier = Modifier.weight(1f))
        PrimaryButton(
          text = "Borrar",
          onClick = onDelete,
          color = Color(0xFFD32F2F),
          modifier = Modifier.weight(1f)
        )
      }
    }
  }
}

@Composable
fun RequestInfoRow(label1: String, value1: String, label2: String, value2: String) {
  Row(Modifier.fillMaxWidth()) {
    InfoBlock(label1, value1, Modifier.weight(1f))
    InfoBlock(label2, value2, Modifier.weight(1f))
  }
}

@Composable
fun InfoBlock(label: String, value: String, modifier: Modifier) {
  Column(modifier = modifier) {
    Text(label, style = MaterialTheme.typography.labelSmall, color = Color.Gray)
    Text(
      value,
      style = MaterialTheme.typography.bodyMedium,
      fontWeight = FontWeight.SemiBold,
      maxLines = 1,
      overflow = TextOverflow.Ellipsis
    )
  }
}

@Composable
fun SecondaryButton(text: String, onClick: () -> Unit, modifier: Modifier = Modifier) {
  OutlinedButton(
    onClick = onClick,
    modifier = modifier,
    shape = RoundedCornerShape(8.dp),
    border = BorderStroke(1.dp, Color.LightGray)
  ) {
    Text(text, color = Color.Black, style = MaterialTheme.typography.bodySmall)
  }
}

@Composable
fun PrimaryButton(text: String, onClick: () -> Unit, color: Color, modifier: Modifier = Modifier) {
  Button(
    onClick = onClick,
    modifier = modifier,
    colors = ButtonDefaults.buttonColors(containerColor = color),
    shape = RoundedCornerShape(8.dp)
  ) {
    Text(text, color = Color.White, style = MaterialTheme.typography.bodySmall)
  }
}