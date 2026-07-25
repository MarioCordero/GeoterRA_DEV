package ucr.ac.cr.inii.geoterra.presentation.components.common

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.DarkMode
import androidx.compose.material.icons.filled.LightMode
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
fun ThemeToggle(
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