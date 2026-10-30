package ucr.ac.cr.inii.geoterra.presentation.components.insitu

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.DeviceThermostat
import androidx.compose.material.icons.filled.Science
import androidx.compose.material.icons.filled.WaterDrop
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import ucr.ac.cr.inii.geoterra.data.model.responses.InSituTestResponse
import ucr.ac.cr.inii.geoterra.presentation.components.common.InfoChip

@Composable
fun InSituTestDetails(
	test: InSituTestResponse,
	modifier: Modifier = Modifier,
	isForPdf: Boolean = false,
	onInSituTestClick: ((String) -> Unit)? = null
) {
	val chipSpacing = 8.dp

	Card(
		modifier = modifier.fillMaxWidth(),
		colors = CardDefaults.cardColors(
			containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
		),
		onClick = {
			if (!isForPdf) {
				onInSituTestClick?.invoke(test.insitu_test_id)
			}
		}
	) {
		Column(
			modifier = Modifier
				.fillMaxWidth()
				.padding(16.dp)
				.then(
					if (isForPdf) Modifier.padding(bottom = 8.dp) else Modifier
				)
		) {
			Row(
				modifier = Modifier.fillMaxWidth(),
				horizontalArrangement = Arrangement.SpaceBetween,
				verticalAlignment = Alignment.CenterVertically
			) {
				Text(
					text = test.insitu_test_name ?: "Prueba In-Situ",
					style = MaterialTheme.typography.titleMedium,
					fontWeight = FontWeight.Bold,
					color = MaterialTheme.colorScheme.onSurface
				)
			}

			Spacer(modifier = Modifier.height(16.dp))

			Column(
				verticalArrangement = Arrangement.spacedBy(chipSpacing)
			) {
				Row(
					modifier = Modifier
						.fillMaxWidth()
						.height(IntrinsicSize.Max),
					horizontalArrangement = Arrangement.spacedBy(chipSpacing)
				) {
					InfoChip(
						icon = Icons.Default.DeviceThermostat,
						label = "Temperatura (°C)",
						value = test.temperature?.toString() ?: "N/D",
						modifier = Modifier
							.weight(1f)
							.fillMaxHeight(),
						iconColor = MaterialTheme.colorScheme.primary,
						labelMaxLines = 2
					)

					InfoChip(
						icon = Icons.Default.Science,
						label = "pH",
						value = test.ph?.toString() ?: "N/D",
						modifier = Modifier
							.weight(1f)
							.fillMaxHeight(),
						iconColor = MaterialTheme.colorScheme.secondary,
						labelMaxLines = 2
					)
				}

				InfoChip(
					icon = Icons.Default.WaterDrop,
					label = "Conductividad (µS/cm)",
					value = test.conductivity?.toString() ?: "N/D",
					modifier = Modifier.fillMaxWidth(),
					iconColor = MaterialTheme.colorScheme.tertiary,
					labelMaxLines = 2
				)

				InfoChip(
					icon = Icons.Default.Description,
					label = "Descripción y Notas",
					value = test.description?.takeIf { it.isNotBlank() } ?: "Sin descripción registrada.",
					modifier = Modifier.fillMaxWidth(),
					maxLines = 5,
					labelMaxLines = 2
				)
			}
		}
	}
}