package ucr.ac.cr.inii.geoterra.presentation.screens.account

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Logout
import androidx.compose.material.icons.filled.Badge
import androidx.compose.material.icons.filled.DarkMode
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.LightMode
import androidx.compose.material.icons.filled.Password
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import ucr.ac.cr.inii.geoterra.presentation.components.common.ActionMenuItem
import ucr.ac.cr.inii.geoterra.presentation.components.common.DangerActionItem
import ucr.ac.cr.inii.geoterra.presentation.components.account.InfoTile
import ucr.ac.cr.inii.geoterra.presentation.components.account.ProfileHeaderCard
import ucr.ac.cr.inii.geoterra.presentation.components.common.ConfirmDialog
import ucr.ac.cr.inii.geoterra.presentation.components.common.SectionHeader
import ucr.ac.cr.inii.geoterra.presentation.components.common.ThemeToggle

@Composable
fun AccountContent(
	modifier: Modifier,
	state: AccountState,
	onLogoutClick: () -> Unit,
	onDeleteAccountClick: () -> Unit,
	onEditClick: () -> Unit,
	onChangePasswordClick: () -> Unit,
	onThemeToggle: (Boolean) -> Unit,
) {
	var showLogoutDialog by remember { mutableStateOf(false) }
	var showDeleteDialog by remember { mutableStateOf(false) }
	val scrollState = rememberScrollState()

	Box(modifier = modifier.fillMaxSize().verticalScroll(scrollState)) {
		if (state.isLoading) {
			CircularProgressIndicator(modifier = Modifier.align(Alignment.Center))
		}

		if (state.user != null) {
			Column(
				modifier = Modifier.fillMaxSize()
					.padding(PaddingValues(start = 16.dp, end = 16.dp, top = 16.dp)),
				verticalArrangement = Arrangement.spacedBy(16.dp)
			) {
				ProfileHeaderCard(state.user)

				if (state.user.role != "user") {
					Card(
						modifier = Modifier.fillMaxWidth(),
						colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
						shape = RoundedCornerShape(24.dp)
					) {
						Row(
							modifier = Modifier.padding(20.dp),
							verticalAlignment = Alignment.CenterVertically
						) {
							Icon(
								Icons.Default.Badge,
								contentDescription = null,
								tint = MaterialTheme.colorScheme.primary,
								modifier = Modifier.size(24.dp)
							)
							Spacer(Modifier.width(16.dp))

							val userRole = when (state.user.role) {
								"admin" -> "Administrador"
								"field_investigator" -> "Investigador de Campo"
								"investigator" -> "Investigador"
								"maintenance" -> "Mantenimiento"
								else -> null
							}

							Text(
								userRole ?: state.user.role,
								style = MaterialTheme.typography.titleLarge,
								fontWeight = FontWeight.Bold,
								color = MaterialTheme.colorScheme.primary
							)
						}
					}
				}

				HorizontalDivider(thickness = 0.5.dp, color = MaterialTheme.colorScheme.outline)

				Column(
					modifier = Modifier.fillMaxWidth(),
					verticalArrangement = Arrangement.spacedBy(4.dp)
				) {
					SectionHeader(title = "Información de Contacto")

					InfoTile(Icons.Default.Email, "Correo electrónico", state.user.email)
					InfoTile(Icons.Default.Phone, "Teléfono", state.user.phone_number ?: "No especificado")
				}

				Column(
					modifier = Modifier.fillMaxWidth(),
					verticalArrangement = Arrangement.spacedBy(4.dp)
				) {
					SectionHeader(title = "Configuración")

					ThemeToggle(
						isDark = state.isDarkMode,
						onToggle = { isDark ->
							onThemeToggle(isDark)
						}
					)

					ActionMenuItem(
						Icons.Default.Edit,
						"Editar información personal",
						onClick = onEditClick
					)

					ActionMenuItem(
						Icons.Default.Password,
						"Cambiar contraseña",
						onClick = onChangePasswordClick
					)
				}

				HorizontalDivider(thickness = 0.5.dp, color = MaterialTheme.colorScheme.outline)

				Column {
					DangerActionItem(
						Icons.AutoMirrored.Filled.Logout,
						"Cerrar sesión",
						onClick = {
							showLogoutDialog = true
						}
					)
//          DangerActionItem(
//            Icons.Default.DeleteForever,
//            "Eliminar cuenta",
//            isCritical = true,
//
//            onClick = { showDeleteDialog = true }
//          )
				}
			}
		}

		if (showLogoutDialog) {
			ConfirmDialog(
				title = "¿Cerrar sesión?",
				message = "Su sesión actual finalizará. Deberá de ingresar sus credenciales la próxima vez.",
				confirmText = "Salir",
				onConfirm = {
					onLogoutClick()
					showLogoutDialog = false
				},
				onDismiss = { showLogoutDialog = false }
			)
		}

		if (showDeleteDialog) {
			ConfirmDialog(
				title = "¿Eliminar cuenta?",
				message = "Esta acción es irreversible. Se borrarán todas tus solicitudes y datos de campo permanentemente.",
				confirmText = "Eliminar",
				isDanger = true,
				onConfirm = {
					onDeleteAccountClick()
					showDeleteDialog = false
				},
				onDismiss = { showDeleteDialog = false }
			)
		}
	}
}