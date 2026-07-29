package ucr.ac.cr.inii.geoterra.presentation.components.request

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun StatusBadge(state: String, modifier: Modifier = Modifier) {
	val color = when (state) {
		"Pendiente" -> Color(0xFFFFB300)
		"Procesada" -> Color(0xFF4CAF50)
		"En Revisión" -> Color(0xFF1C5799)
		else -> MaterialTheme.colorScheme.primary
	}

	Surface(
		color = MaterialTheme.colorScheme.primaryContainer,
		shape = RoundedCornerShape(12.dp),
		modifier = modifier,
	) {
		Row(
			modifier = Modifier
				.fillMaxWidth()
				.padding(horizontal = 4.dp, vertical = 8.dp),
			horizontalArrangement = Arrangement.Center,
			verticalAlignment = Alignment.CenterVertically
		) {
			Text(
				text = state.uppercase(),
				style = MaterialTheme.typography.labelLarge.copy(
					fontWeight = FontWeight.Bold,
					letterSpacing = 1.sp
				),
				color = color,
				maxLines = 1
			)
		}
	}
}