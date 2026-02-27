package ucr.ac.cr.inii.geoterra.presentation.screens.analysisform

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import ucr.ac.cr.inii.geoterra.presentation.components.layout.CustomTextField
import ucr.ac.cr.inii.geoterra.presentation.components.layout.FormSection

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AnalysisFormContent(
  state: AnalysisFormState,
  onEvent: (AnalysisFormEvent) -> Unit
) {
  Column(
    modifier = Modifier
      .fillMaxSize()
      .padding(16.dp)
      .background(Color(0xFFF8F9FA))
      .verticalScroll(rememberScrollState())
      .padding(20.dp),
    verticalArrangement = Arrangement.spacedBy(20.dp)
  ) {
    FormSection(title = "Información General", icon = Icons.Default.Info) {
      CustomTextField(
        value = state.region,
        onValueChange = { onEvent(AnalysisFormEvent.RegionChanged(it)) },
        label = "Región / Provincia",
        icon = Icons.Default.Place
      )
      CustomTextField(
        value = state.email,
        onValueChange = { onEvent(AnalysisFormEvent.EmailChanged(it)) },
        label = "Correo de contacto",
        icon = Icons.Default.Email,
        keyboardType = KeyboardType.Email
      )
    }
    
    // --- SECCIÓN: PROPIETARIO ---
    FormSection(title = "Datos del Propietario", icon = Icons.Default.Person) {
      CustomTextField(
        value = state.ownerName,
        onValueChange = { onEvent(AnalysisFormEvent.OwnerNameChanged(it)) },
        label = "Nombre completo",
        icon = Icons.Default.AccountCircle
      )
      CustomTextField(
        value = state.ownerContact,
        onValueChange = { onEvent(AnalysisFormEvent.OwnerContactChanged(it)) },
        label = "Teléfono de contacto",
        icon = Icons.Default.Phone,
        keyboardType = KeyboardType.Phone
      )
      CustomTextField(
        value = state.currentUsage,
        onValueChange = { onEvent(AnalysisFormEvent.UsageChanged(it)) },
        label = "Uso actual",
        icon = Icons.Default.Phone,
        keyboardType = KeyboardType.Phone
      )
    }
    
    // --- SECESSION: OBSERVACIONES ---
    FormSection(title = "Observaciones de Campo", icon = Icons.Default.Visibility) {
      CustomTextField(
        value = state.temperatureSensation,
        onValueChange = { onEvent(AnalysisFormEvent.TempChanged(it)) },
        label = "Sensación térmica (ej: Muy Caliente)",
        icon = Icons.Default.Thermostat
      )
      
      Row(
        modifier = Modifier
          .fillMaxWidth()
          .padding(vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
      ) {
        Column(modifier = Modifier.weight(1f)) {
          Text("Presencia de burbujas", fontWeight = FontWeight.SemiBold)
          Text("¿Se observan burbujas en el agua?", style = MaterialTheme.typography.bodySmall)
        }
        Switch(
          checked = state.bubbles,
          onCheckedChange = { onEvent(AnalysisFormEvent.BubblesChanged(it)) },
          colors = SwitchDefaults.colors(checkedThumbColor = Color(0xFFF57C00))
        )
      }
      
      CustomTextField(
        value = state.details,
        onValueChange = { onEvent(AnalysisFormEvent.DetailsChanged(it)) },
        label = "Detalles adicionales",
        icon = Icons.Default.Description,
        singleLine = false,
        minLines = 2
      )
    }
//
//    // --- SECCIÓN: COORDENADAS ---
//    FormSection(title = "Ubicación Geográfica", icon = Icons.Default.Map) {
//      Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
//        CustomTextField(
//          value = state.latitude,
//          onValueChange = { onEvent(AnalysisFormEvent.LatChanged(it)) },
//          label = "Latitud",
//          modifier = Modifier.weight(1f),
//          keyboardType = KeyboardType.Number
//        )
//        CustomTextField(
//          value = state.longitude,
//          onValueChange = { onEvent(AnalysisFormEvent.LonChanged(it)) },
//          label = "Longitud",
//          modifier = Modifier.weight(1f),
//          keyboardType = KeyboardType.Number
//        )
//      }
//    }

    FormSection(title = "Ubicación Geográfica", icon = Icons.Default.Map) {
      Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
          CustomTextField(
            value = state.latitude,
            onValueChange = { onEvent(AnalysisFormEvent.LatChanged(it)) },
            label = "Latitud",
            modifier = Modifier.weight(1f),
            keyboardType = KeyboardType.Number,
            readOnly = true // Opcional: para que usen los botones
          )
          CustomTextField(
            value = state.longitude,
            onValueChange = { onEvent(AnalysisFormEvent.LonChanged(it)) },
            label = "Longitud",
            modifier = Modifier.weight(1f),
            keyboardType = KeyboardType.Number,
            readOnly = true
          )
        }

        // Botones de Acción
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
          OutlinedButton(
            onClick = { onEvent(AnalysisFormEvent.UseCurrentLocation) },
            modifier = Modifier.weight(1f),
            shape = RoundedCornerShape(8.dp)
          ) {
            Icon(Icons.Default.MyLocation, contentDescription = null)
            Spacer(Modifier.width(4.dp))
            Text("GPS Actual", style = MaterialTheme.typography.labelSmall)
          }

          Button(
            onClick = { onEvent(AnalysisFormEvent.TakePhoto) },
            modifier = Modifier.weight(1f),
            shape = RoundedCornerShape(8.dp),
            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF455A64))
          ) {
            Icon(Icons.Default.CameraAlt, contentDescription = null)
            Spacer(Modifier.width(4.dp))
            Text("Tomar Foto", style = MaterialTheme.typography.labelSmall)
          }
        }
      }
    }
    
    if (state.error != null) {
      Card(
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer),
        modifier = Modifier.fillMaxWidth()
      ) {
        Text(
          text = state.error,
          color = Color.Red,
          modifier = Modifier.padding(12.dp),
          style = MaterialTheme.typography.bodySmall
        )
      }
    }
    
    Spacer(Modifier.height(8.dp))
    
    Button(
      onClick = { onEvent(AnalysisFormEvent.Submit) },
      modifier = Modifier
        .fillMaxWidth()
        .height(56.dp),
      shape = RoundedCornerShape(12.dp),
      colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary),
      enabled = !state.isLoading
    ) {
      if (state.isLoading) {
        CircularProgressIndicator(modifier = Modifier.size(24.dp), color = Color.White)
      } else {
        Text("GUARDAR SOLICITUD", fontWeight = FontWeight.Bold, letterSpacing = 1.2.sp)
      }
    }
  }
}
