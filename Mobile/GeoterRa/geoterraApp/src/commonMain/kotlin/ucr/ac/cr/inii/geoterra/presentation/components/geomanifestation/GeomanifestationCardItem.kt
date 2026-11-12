package ucr.ac.cr.inii.geoterra.presentation.components.geomanifestation

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import ucr.ac.cr.inii.geoterra.data.model.responses.GeomanifestationResponse
import ucr.ac.cr.inii.geoterra.presentation.components.common.ActionButton
import ucr.ac.cr.inii.geoterra.presentation.components.common.InfoChip
import ucr.ac.cr.inii.geoterra.presentation.components.common.OutlinedActionButton

@Composable
fun GeomanifestationCardItem(
	manifestation: GeomanifestationResponse,
	onDetailsClick: () -> Unit,
	onEditClick: (() -> Unit),
	onDeleteClick: (() -> Unit),
	modifier: Modifier = Modifier
) {
	Card(
		modifier = modifier
			.fillMaxWidth()
			.padding(horizontal = 4.dp),
		shape = RoundedCornerShape(24.dp),
		elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
		colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
	) {
		Column(
			modifier = Modifier
				.fillMaxWidth()
				.padding(20.dp),
			verticalArrangement = Arrangement.spacedBy(16.dp)
		) {
			Text(
				text = manifestation.geomanifestation_name,
				style = MaterialTheme.typography.titleLarge.copy(
					fontWeight = FontWeight.ExtraBold,
				),
				color = MaterialTheme.colorScheme.onSurface,
				maxLines = 2,
				overflow = TextOverflow.Ellipsis
			)

			Column(
				modifier = Modifier.fillMaxWidth(),
				verticalArrangement = Arrangement.spacedBy(8.dp)
			) {
				InfoChip(
					icon = Icons.Default.LocationOn,
					label = "Ubicación Geográfica",
					value = "${manifestation.location.province}, ${manifestation.location.canton}, ${manifestation.location.district}",
					modifier = Modifier.fillMaxWidth(),
					iconColor = MaterialTheme.colorScheme.primary
				)

				InfoChip(
					icon = Icons.Default.Description,
					label = "Descripción",
					value = if (manifestation.description.isNullOrBlank()) "Sin Descripción" else manifestation.description,
					modifier = Modifier.fillMaxWidth(),
					iconColor = MaterialTheme.colorScheme.secondary,
					maxLines = 2
				)
			}

			Row(
				modifier = Modifier.fillMaxWidth(),
				horizontalArrangement = Arrangement.spacedBy(8.dp),
				verticalAlignment = Alignment.CenterVertically
			) {
				ActionButton(
					text = "Detalles",
					onClick = onDetailsClick,
					modifier = Modifier.weight(1f),
					isCompact = true
				)

				OutlinedActionButton(
					text = "Editar",
					onClick = onEditClick,
					modifier = Modifier.weight(1f),
					isCompact = true
				)

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