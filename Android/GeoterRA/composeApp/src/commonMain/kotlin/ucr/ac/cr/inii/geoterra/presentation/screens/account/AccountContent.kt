package ucr.ac.cr.inii.geoterra.presentation.screens.account

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.List
import androidx.compose.material.icons.automirrored.filled.Logout
import androidx.compose.material.icons.filled.AccountCircle
import androidx.compose.material.icons.filled.Badge
import androidx.compose.material.icons.filled.DeleteForever
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.List
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SegmentedButtonDefaults.Icon
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.VerticalDivider
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import ucr.ac.cr.inii.geoterra.presentation.components.account.ActionMenuItem
import ucr.ac.cr.inii.geoterra.presentation.components.account.DangerActionItem
import ucr.ac.cr.inii.geoterra.presentation.components.account.InfoTile
import ucr.ac.cr.inii.geoterra.presentation.components.account.ProfileHeaderCard

@Composable
fun AccountContent(
  state: AccountState,
  onLogoutClick: () -> Unit,
  onDeleteAccountClick: () -> Unit,
  onEditClick: () -> Unit,
  onRefresh: () -> Unit
) {
  var showLogoutDialog by remember { mutableStateOf(false) }
  var showDeleteDialog by remember { mutableStateOf(false) }
  
  Scaffold(
    topBar = {
      Column(modifier = Modifier.padding(horizontal = 20.dp, vertical = 10.dp)) {
        Text(
          text = "Mi Perfil",
          style = MaterialTheme.typography.headlineMedium,
          fontWeight = FontWeight.Bold,
          color = Color(0xFF1A237E) // Azul GeoTerra
        )
      }
    }
  ) { paddingValues ->
    Box(modifier = Modifier.fillMaxSize().padding(paddingValues)) {
      if (state.isLoading) {
        CircularProgressIndicator(modifier = Modifier.align(Alignment.Center))
      } else if (state.user != null) {
        LazyColumn(
          modifier = Modifier.fillMaxSize(),
          contentPadding = PaddingValues(20.dp),
          verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
          // Tarjeta de información principal
          item {
            ProfileHeaderCard(state.user)
          }
          
          // Sección de Información de Contacto
          item {
            Column {
              InfoTile(Icons.Default.Email, "Correo electrónico", state.user.email)
              InfoTile(Icons.Default.Phone, "Teléfono", state.user.phone_number ?: "No asignado")
              InfoTile(Icons.Default.Badge, "Rol de usuario", state.user.role)
            }
          }
          
          // Menú de Opciones
          item {
            Text("Configuración", style = MaterialTheme.typography.labelLarge, color = Color.Gray)
            Spacer(Modifier.height(8.dp))
            ActionMenuItem(Icons.Default.Edit, "Editar información personal", onClick = onEditClick)
            ActionMenuItem(
              Icons.Default.History,
              "Historial de solicitudes",
              onClick = { /* Historial */ })
            ActionMenuItem(Icons.Default.Refresh, "Refrescar datos", onClick = onRefresh)
          }
          
          // Acciones de Cuenta (Peligro)
          item {
            Spacer(Modifier.height(16.dp))
            HorizontalDivider(thickness = 0.5.dp, color = Color.LightGray)
            Spacer(Modifier.height(16.dp))
            
            DangerActionItem(
              Icons.AutoMirrored.Filled.Logout,
              "Cerrar sesión",
              onClick = { showLogoutDialog = true })
            DangerActionItem(
              Icons.Default.DeleteForever,
              "Eliminar cuenta",
              isCritical = true,
              onClick = { showDeleteDialog = true })
          }
        }
      } else if (state.error != null) {
//                ErrorView(state.error, onRefresh)
      }
    }
  }

//    // Diálogos de Confirmación
//    if (showLogoutDialog) {
//        SimpleConfirmDialog("¿Cerrar sesión?", "¿Estás seguro de que deseas salir?", "Salir", onConfirm = onLogoutClick, onDismiss = { showLogoutDialog = false })
//    }
//    if (showDeleteDialog) {
//        SimpleConfirmDialog("¿Eliminar cuenta?", "Esta acción es irreversible. Se borrarán todos tus datos.", "Eliminar", isDanger = true, onConfirm = onDeleteAccountClick, onDismiss = { showDeleteDialog = false })
//    }
}