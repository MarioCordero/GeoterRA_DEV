package ucr.ac.cr.inii.geoterra.presentation.components.request

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun StatusHistoryChip(
	statusValue: String,
	createdAt: String,
	description: String
) {
	Column(
		modifier = Modifier
			.background(
				color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
				shape = RoundedCornerShape(16.dp)
			)
			.padding(12.dp)
			.fillMaxWidth()
	) {
		Row(
			horizontalArrangement = Arrangement.Start,
			verticalAlignment = Alignment.CenterVertically
		) {
			StatusBadge(
				state = statusValue,
				modifier = Modifier.width(120.dp)
			)
		}

		Spacer(modifier = Modifier.height(12.dp))


		Column {
			Text(
				text = "Detalles",
				fontWeight = FontWeight.Bold,
				color = MaterialTheme.colorScheme.onSurface,
				fontSize = 14.sp
			)
			Text(
				text = description.ifBlank { "Sin detalles adicionales" },
				color = MaterialTheme.colorScheme.onSurface,
				fontSize = 14.sp,
				lineHeight = 20.sp
			)
		}

		Spacer(modifier = Modifier.height(12.dp))

		Row(
			horizontalArrangement = Arrangement.Center,
			verticalAlignment = Alignment.CenterVertically,
			modifier = Modifier.fillMaxWidth()
		) {
			Text(
				text = "Asignado el: ${createdAt}",
				style = MaterialTheme.typography.labelMedium,
			)
		}
	}
}