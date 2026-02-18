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

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AnalysisFormContent(
    state: AnalysisFormState,
    onEvent: (AnalysisFormEvent) -> Unit,
    onCancel: () -> Unit
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(if (state.isEditing) "Editar Solicitud" else "Nueva Solicitud") },
                navigationIcon = {
                    IconButton(onClick = onCancel) {
                        Icon(Icons.Default.Close, contentDescription = "Cerrar")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color.White,
                    titleContentColor = Color(0xFF1A237E)
                )
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .background(Color(0xFFF8F9FA))
                .verticalScroll(rememberScrollState())
                .padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(20.dp)
        ) {
            // --- SECCIÓN: INFORMACIÓN GENERAL ---
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

            // --- SECCIÓN: OBSERVACIONES ---
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
                    minLines = 3
                )
            }

            // --- SECCIÓN: COORDENADAS ---
            FormSection(title = "Ubicación Geográfica", icon = Icons.Default.Map) {
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    CustomTextField(
                        value = state.latitude,
                        onValueChange = { onEvent(AnalysisFormEvent.LatChanged(it)) },
                        label = "Latitud",
                        modifier = Modifier.weight(1f),
                        keyboardType = KeyboardType.Number
                    )
                    CustomTextField(
                        value = state.longitude,
                        onValueChange = { onEvent(AnalysisFormEvent.LonChanged(it)) },
                        label = "Longitud",
                        modifier = Modifier.weight(1f),
                        keyboardType = KeyboardType.Number
                    )
                }
            }

            if (state.error != null) {
                Card(
                    colors = CardDefaults.cardColors(containerColor = Color(0xFFFFEBEE)),
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
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFF57C00)),
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
}

// --- COMPONENTES AUXILIARES PARA LIMPIEZA VISUAL ---

@Composable
fun FormSection(title: String, icon: ImageVector, content: @Composable ColumnScope.() -> Unit) {
    Column(modifier = Modifier.fillMaxWidth()) {
        Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(bottom = 8.dp)) {
            Icon(icon, contentDescription = null, tint = Color(0xFFF57C00), modifier = Modifier.size(20.dp))
            Spacer(Modifier.width(8.dp))
            Text(text = title, fontWeight = FontWeight.Bold, color = Color(0xFF1A237E), fontSize = 16.sp)
        }
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
            shape = RoundedCornerShape(16.dp)
        ) {
            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                content()
            }
        }
    }
}

@Composable
fun CustomTextField(
    value: String,
    onValueChange: (String) -> Unit,
    label: String,
    icon: ImageVector? = null,
    modifier: Modifier = Modifier,
    keyboardType: KeyboardType = KeyboardType.Text,
    singleLine: Boolean = true,
    minLines: Int = 1
) {
    OutlinedTextField(
        value = value,
        onValueChange = onValueChange,
        label = { Text(label) },
        leadingIcon = icon?.let { { Icon(it, contentDescription = null, tint = Color.Gray) } },
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        keyboardOptions = KeyboardOptions(keyboardType = keyboardType),
        singleLine = singleLine,
        minLines = minLines,
        colors = OutlinedTextFieldDefaults.colors(
            focusedBorderColor = Color(0xFFF57C00),
            focusedLabelColor = Color(0xFFF57C00)
        )
    )
}