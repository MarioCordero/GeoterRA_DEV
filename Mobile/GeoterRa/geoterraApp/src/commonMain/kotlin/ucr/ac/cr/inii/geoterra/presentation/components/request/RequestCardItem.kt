package ucr.ac.cr.inii.geoterra.presentation.components.request

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.IntrinsicSize
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Explore
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import ucr.ac.cr.inii.geoterra.data.model.responses.InvestigationRequestResponse
import ucr.ac.cr.inii.geoterra.presentation.components.common.ActionButton
import ucr.ac.cr.inii.geoterra.presentation.components.common.InfoChip
import ucr.ac.cr.inii.geoterra.presentation.components.common.OutlinedActionButton

@Composable
fun RequestCardItem(
	request: InvestigationRequestResponse,
	onView: () -> Unit,
	onEdit: () -> Unit,
	onDelete: () -> Unit
) {
	Card(
		modifier = Modifier
			.fillMaxWidth()
			.padding(horizontal = 4.dp),
		shape = RoundedCornerShape(24.dp),
		elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
		colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
	) {
		Column(modifier = Modifier.padding(20.dp)) {
			Row(
				modifier = Modifier.fillMaxWidth(),
				horizontalArrangement = Arrangement.SpaceBetween,
				verticalAlignment = Alignment.Top
			) {
				Column(modifier = Modifier.weight(1f).padding(end = 12.dp)) {
					Text(
						text = request.request_name,
						style = MaterialTheme.typography.titleLarge.copy(
							fontWeight = FontWeight.ExtraBold,
						),
						color = MaterialTheme.colorScheme.onSurface,
						maxLines = 2,
						overflow = TextOverflow.Ellipsis
					)
					Text(
						text = "Fecha de creación: ${request.created_at.take(10)}",
						style = MaterialTheme.typography.labelSmall,
						color = MaterialTheme.colorScheme.onSurface
					)
				}
				StatusBadge(
					state = request.current_state.value,
					modifier = Modifier.width(110.dp)
				)
			}

			Spacer(modifier = Modifier.height(16.dp))

			InfoChip(
				icon = Icons.Default.LocationOn,
				label = "Ubicación Geográfica",
				value = "${request.location.province}, ${request.location.canton}, ${request.location.district}",
				modifier = Modifier.fillMaxWidth()
			)

			Spacer(modifier = Modifier.height(8.dp))

			Row(
				modifier = Modifier
					.fillMaxWidth()
					.height(IntrinsicSize.Max),
				horizontalArrangement = Arrangement.spacedBy(8.dp)

			) {
				InfoChip(
					icon = Icons.Default.Explore,
					label = "Latitud",
					value = request.location.latitude.toString(),
					modifier = Modifier
						.weight(1f)
						.fillMaxHeight(),
					maxLines = 1,
					iconColor = MaterialTheme.colorScheme.secondary
				)
				InfoChip(
					icon = Icons.Default.Explore,
					label = "Longitud",
					value = request.location.longitude.toString(),
					modifier = Modifier
						.weight(1f)
						.fillMaxHeight(),
					maxLines = 1,
					iconColor = MaterialTheme.colorScheme.secondary
				)
			}

			Spacer(modifier = Modifier.height(20.dp))

			Row(
				modifier = Modifier.fillMaxWidth(),
				horizontalArrangement = Arrangement.spacedBy(10.dp),
				verticalAlignment = Alignment.CenterVertically
			) {

				ActionButton(
					text = "Detalles",
					onClick = onView,
					modifier = Modifier.weight(1f),
					isCompact = true
				)

				if (request.current_state.value == "Pendiente") {
					OutlinedActionButton(
						text = "Editar",
						onClick = onEdit,
						modifier = Modifier.weight(1f),
						isCompact = true
					)

					OutlinedActionButton(
						text = "Eliminar",
						onClick = onDelete,
						modifier = Modifier.weight(1f),
						isCompact = true
					)
				}
			}
		}
	}
}
