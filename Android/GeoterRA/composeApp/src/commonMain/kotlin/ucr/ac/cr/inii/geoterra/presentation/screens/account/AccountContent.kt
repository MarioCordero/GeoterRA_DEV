package ucr.ac.cr.inii.geoterra.presentation.screens.account

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun AccountContent(
    state: AccountState,
    onLogoutClick: () -> Unit,
    onRefresh: () -> Unit
) {
    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Text("Mi Perfil", style = MaterialTheme.typography.bodyMedium)
        Spacer(Modifier.height(20.dp))

        if (state.isLoading) {
            CircularProgressIndicator(modifier = Modifier.align(Alignment.CenterHorizontally))
        } else if (state.user != null) {
            Card(elevation = CardDefaults.cardElevation(defaultElevation = 4.dp), modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Nombre: ${state.user.first_name} ${state.user.last_name}")
                    Text("Email: ${state.user.email}")
                    Text("Teléfono: ${state.user.phone_number ?: "No asignado"}")
                    Text("Rol: ${state.user.role}")
                }
            }
            Spacer(Modifier.height(24.dp))
        } else {
            Text("No se pudo cargar el perfil", color = Color.Red)
        }
        Button(
            onClick = onLogoutClick,
            modifier = Modifier.fillMaxWidth(),
        ) {
            Text("Cerrar Sesión")
        }
        Button(onClick = onRefresh) { Text("Reintentar") }

    }
}