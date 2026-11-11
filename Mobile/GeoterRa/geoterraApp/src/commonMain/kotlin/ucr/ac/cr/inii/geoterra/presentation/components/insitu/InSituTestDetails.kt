package ucr.ac.cr.inii.geoterra.presentation.components.insitu

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.DeviceThermostat
import androidx.compose.material.icons.filled.Science
import androidx.compose.material.icons.filled.WaterDrop
import androidx.compose.material3.ButtonColors
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import ucr.ac.cr.inii.geoterra.data.model.responses.InSituTestResponse
import ucr.ac.cr.inii.geoterra.presentation.components.common.ActionButton
import ucr.ac.cr.inii.geoterra.presentation.components.common.InfoChip
import ucr.ac.cr.inii.geoterra.presentation.components.common.OutlinedActionButton

@Composable
fun InSituTestDetails(
	test: InSituTestResponse,
	modifier: Modifier = Modifier,
	isForPdf: Boolean = false,
	onEditClick: (() -> Unit)? = null,
	onDeleteClick: (() -> Unit)? = null
) {
	val chipSpacing = 8.dp

	Card(
		modifier = modifier.fillMaxWidth(),
		colors = CardDefaults.cardColors(
			containerColor = MaterialTheme.colorScheme.surface
		)
	) {
		Column(
			modifier = Modifier
				.fillMaxWidth()
				.padding(16.dp)
				.then(
					if (isForPdf) Modifier.padding(bottom = 8.dp) else Modifier
				),
			verticalArrangement = Arrangement.spacedBy(16.dp)
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

			if (!isForPdf && (onEditClick != null || onDeleteClick != null)) {
				Row(
					modifier = Modifier.fillMaxWidth(),
					horizontalArrangement = Arrangement.spacedBy(8.dp),
					verticalAlignment = Alignment.CenterVertically
				) {
					if (onEditClick != null) {
						OutlinedActionButton(
							text = "Editar",
							onClick = onEditClick,
							modifier = Modifier.weight(1f),
							isCompact = true
						)
					}
					if (onDeleteClick != null) {
						OutlinedActionButton(
							text = "Eliminar",
							onClick = onDeleteClick,
							modifier = Modifier.weight(1f),
							isCompact = true
						)
					}
				}
			}
		}
	}
}