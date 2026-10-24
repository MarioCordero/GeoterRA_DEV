package ucr.ac.cr.inii.geoterra.presentation.components.fieldtrip

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CalendarToday
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import ucr.ac.cr.inii.geoterra.data.model.responses.FieldTripResponse
import ucr.ac.cr.inii.geoterra.presentation.components.common.ActionButton
import ucr.ac.cr.inii.geoterra.presentation.components.common.InfoChip
import ucr.ac.cr.inii.geoterra.presentation.components.common.OutlinedActionButton

@Composable
fun FieldTripCardItem(
	fieldTrip: FieldTripResponse,
	currentUserId: String?,
	currentUserRole: String?,
	onView: () -> Unit,
	onEdit: () -> Unit,
	onDelete: () -> Unit,
	modifier: Modifier = Modifier
) {
	val isAdmin = currentUserRole == "admin"
	val isInvestigator = currentUserRole == "investigator"
	val isCreator = currentUserId != null && fieldTrip.creator.user_id == currentUserId
	val isParticipant = currentUserId != null && fieldTrip.participants.any { it.user_id == currentUserId }

	val showEdit = isAdmin || (isInvestigator && (isCreator || isParticipant))
	val showDelete = isAdmin || (isInvestigator && isCreator)

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
			Row(
				modifier = Modifier.fillMaxWidth(),
				horizontalArrangement = Arrangement.SpaceBetween,
				verticalAlignment = Alignment.Top
			) {
				Column(
					modifier = Modifier
						.weight(1f)
						.padding(end = 12.dp),
					verticalArrangement = Arrangement.spacedBy(4.dp)
				) {
					Text(
						text = fieldTrip.field_trip_name,
						style = MaterialTheme.typography.titleLarge.copy(
							fontWeight = FontWeight.ExtraBold,
						),
						color = MaterialTheme.colorScheme.onSurface,
						maxLines = 2,
						overflow = TextOverflow.Ellipsis
					)
				}

				Surface(
					shape = RoundedCornerShape(8.dp),
					color = if (fieldTrip.field_trip_is_active)
						MaterialTheme.colorScheme.primaryContainer
					else
						MaterialTheme.colorScheme.errorContainer
				) {
					Text(
						text = if (fieldTrip.field_trip_is_active) "Activa" else "Inactiva",
						style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
						color = if (fieldTrip.field_trip_is_active)
							MaterialTheme.colorScheme.onPrimaryContainer
						else
							MaterialTheme.colorScheme.onErrorContainer,
						modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
					)
				}
			}

			Column(
				modifier = Modifier.fillMaxWidth(),
				verticalArrangement = Arrangement.spacedBy(8.dp)
			) {
				InfoChip(
					icon = Icons.Default.CalendarToday,
					label = "Fecha programada",
					value = fieldTrip.field_trip_scheduled_date.take(10),
					modifier = Modifier.fillMaxWidth(),
					iconColor = MaterialTheme.colorScheme.primary
				)

				InfoChip(
					icon = Icons.Default.LocationOn,
					label = "Ubicación",
					value = "${fieldTrip.location.province}, ${fieldTrip.location.canton}",
					modifier = Modifier.fillMaxWidth(),
					iconColor = MaterialTheme.colorScheme.secondary
				)

				InfoChip(
					icon = Icons.Default.Person,
					label = "Organizador",
					value = "${fieldTrip.creator.first_name} ${fieldTrip.creator.last_name}",
					modifier = Modifier.fillMaxWidth(),
					iconColor = MaterialTheme.colorScheme.tertiary,
					maxLines = 1
				)
			}

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

				if (showEdit) {
					OutlinedActionButton(
						text = "Editar",
						onClick = onEdit,
						modifier = Modifier.weight(1f),
						isCompact = true
					)
				}

				if (showDelete) {
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