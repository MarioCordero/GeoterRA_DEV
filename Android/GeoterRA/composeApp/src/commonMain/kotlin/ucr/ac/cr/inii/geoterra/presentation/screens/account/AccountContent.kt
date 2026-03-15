package ucr.ac.cr.inii.geoterra.presentation.screens.account

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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Logout
import androidx.compose.material.icons.filled.Badge
import androidx.compose.material.icons.filled.DarkMode
import androidx.compose.material.icons.filled.DeleteForever
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.LightMode
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import ucr.ac.cr.inii.geoterra.presentation.components.layout.ActionMenuItem
import ucr.ac.cr.inii.geoterra.presentation.components.layout.DangerActionItem
import ucr.ac.cr.inii.geoterra.presentation.components.account.InfoTile
import ucr.ac.cr.inii.geoterra.presentation.components.account.ProfileHeaderCard
import ucr.ac.cr.inii.geoterra.presentation.components.layout.ConfirmDialog
import ucr.ac.cr.inii.geoterra.presentation.components.layout.StatusDialog

@Composable
fun AccountContent(
  modifier: Modifier,
  state: AccountState,
  onLogoutClick: () -> Unit,
  onDeleteAccountClick: () -> Unit,
  onEditClick: () -> Unit,
  onThemeToggle: (Boolean) -> Unit
) {
  var showLogoutDialog by remember { mutableStateOf(false) }
  var showDeleteDialog by remember { mutableStateOf(false) }

  Box(modifier = modifier.fillMaxSize()) {
    if (state.isLoading) {
      CircularProgressIndicator(modifier = Modifier.align(Alignment.Center))
    } else if (state.user != null) {
      LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
      ) {
        item {
          ProfileHeaderCard(state.user)
        }

        item {
          Column {
            InfoTile(Icons.Default.Email, "Correo electrónico", state.user.email)
            InfoTile(Icons.Default.Phone, "Teléfono", state.user.phone_number ?: "No asignado")
            InfoTile(Icons.Default.Badge, "Rol de usuario", state.user.role)
          }
        }

        item {
          Text("Configuración", style = MaterialTheme.typography.labelLarge, color = Color.Gray)
          Spacer(Modifier.height(8.dp))
          ThemeSelectorItem(
            isDark = state.isDarkMode,
            onToggle = { isDark ->
              onThemeToggle(isDark)
            }
          )
          ActionMenuItem(Icons.Default.Edit, "Editar información personal", onClick = onEditClick)
          ActionMenuItem(Icons.Default.History, "Historial de solicitudes", onClick = { /* Historial */ })
        }

        // Acciones de Cuenta (Peligro)
        item {
          Spacer(Modifier.height(16.dp))
          HorizontalDivider(thickness = 0.5.dp, color = MaterialTheme.colorScheme.outline)
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
      StatusDialog(false, state.error, onDismiss = { showDeleteDialog = false })
    }
  }
  
  if (showLogoutDialog) {
    ConfirmDialog(
      title = "¿Cerrar sesión?",
      message = "Tu sesión actual finalizará. Deberás ingresar tus credenciales la próxima vez.",
      confirmText = "Salir",
      onConfirm = onLogoutClick,
      onDismiss = { showLogoutDialog = false }
    )
  }
  
  if (showDeleteDialog) {
    ConfirmDialog(
      title = "¿Eliminar cuenta?",
      message = "Esta acción es irreversible. Se borrarán todas tus solicitudes y datos de campo permanentemente.",
      confirmText = "Eliminar",
      isDanger = true,
      onConfirm = onDeleteAccountClick,
      onDismiss = { showDeleteDialog = false }
    )
  }
}

@Composable
fun ThemeSelectorItem(
  isDark: Boolean,
  onToggle: (Boolean) -> Unit
) {
  Surface(
    onClick = { onToggle(!isDark) },
    shape = RoundedCornerShape(12.dp),
    color = Color.Transparent
  ) {
    Row(
      modifier = Modifier
        .fillMaxWidth()
        .padding(vertical = 8.dp),
      verticalAlignment = Alignment.CenterVertically,
      horizontalArrangement = Arrangement.SpaceBetween
    ) {
      Row(verticalAlignment = Alignment.CenterVertically) {
        Icon(
          imageVector = if (isDark) Icons.Default.DarkMode else Icons.Default.LightMode,
          contentDescription = null,
          tint = MaterialTheme.colorScheme.primary
        )
        Spacer(Modifier.width(12.dp))
        Text(
          text = if (isDark) "Modo Oscuro" else "Modo Claro",
          style = MaterialTheme.typography.bodyLarge
        )
      }

      Switch(
        checked = isDark,
        onCheckedChange = onToggle,
        thumbContent = {
          Icon(
            modifier = Modifier.size(SwitchDefaults.IconSize),
            imageVector = if (isDark) Icons.Default.DarkMode else Icons.Default.LightMode,
            contentDescription = null,
          )
        }
      )
    }
  }
}