package ucr.ac.cr.inii.geoterra.presentation.components.common

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Explore
import androidx.compose.material.icons.filled.SignalWifiConnectedNoInternet4
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

@Composable
fun FieldTripToggle(
	isFieldTripActive: Boolean,
	onToggle: (Boolean) -> Unit
) {
	Surface(
		onClick = { onToggle(!isFieldTripActive) },
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
			Row(
				verticalAlignment = Alignment.CenterVertically,
				modifier = Modifier.weight(1f)
			) {
				Icon(
					imageVector = if (isFieldTripActive) Icons.Default.SignalWifiConnectedNoInternet4 else Icons.Default.Explore,
					contentDescription = null,
					tint = MaterialTheme.colorScheme.primary
				)
				Spacer(Modifier.width(12.dp))
				Column {
					Text(
						text = "Modo Gira de Campo",
						style = MaterialTheme.typography.bodyLarge
					)
					Text(
						text = if (isFieldTripActive) "Modo offline activo (Datos en memoria)" else "Modo normal de solicitudes",
						style = MaterialTheme.typography.bodySmall,
						color = MaterialTheme.colorScheme.onSurfaceVariant
					)
				}
			}

			Switch(
				checked = isFieldTripActive,
				onCheckedChange = onToggle,
				thumbContent = {
					Icon(
						modifier = Modifier.size(SwitchDefaults.IconSize),
						imageVector = Icons.Default.Explore,
						contentDescription = null
					)
				}
			)
		}
	}
}