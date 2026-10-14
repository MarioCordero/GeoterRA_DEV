package ucr.ac.cr.inii.geoterra.presentation.components.fieldtrip

import androidx.compose.foundation.clickable
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

@Composable
fun FieldTripCardItem(
	fieldTrip: FieldTripResponse,
	onView: () -> Unit,
	modifier: Modifier = Modifier
) {
	Card(
		modifier = modifier
			.fillMaxWidth()
			.clickable(onClick = onView),
		shape = RoundedCornerShape(16.dp),
		colors = CardDefaults.cardColors(
			containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
		),
		elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
	) {
		Column(
			modifier = Modifier
				.fillMaxWidth()
				.padding(16.dp),
			verticalArrangement = Arrangement.spacedBy(10.dp)
		) {
			Row(
				modifier = Modifier.fillMaxWidth(),
				horizontalArrangement = Arrangement.SpaceBetween,
				verticalAlignment = Alignment.CenterVertically
			) {
				Text(
					text = fieldTrip.field_trip_name,
					style = MaterialTheme.typography.titleMedium,
					fontWeight = FontWeight.Bold,
					color = MaterialTheme.colorScheme.onSurface,
					modifier = Modifier.weight(1f),
					maxLines = 1,
					overflow = TextOverflow.Ellipsis
				)
				Surface(
					shape = RoundedCornerShape(8.dp),
					color = if (fieldTrip.field_trip_is_active) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.errorContainer
				) {
					Text(
						text = if (fieldTrip.field_trip_is_active) "Activa" else "Inactiva",
						style = MaterialTheme.typography.labelSmall,
						color = if (fieldTrip.field_trip_is_active) MaterialTheme.colorScheme.onPrimaryContainer else MaterialTheme.colorScheme.onErrorContainer,
						modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
					)
				}
			}

			Row(
				verticalAlignment = Alignment.CenterVertically,
				horizontalArrangement = Arrangement.spacedBy(6.dp)
			) {
				Icon(
					imageVector = Icons.Default.CalendarToday,
					contentDescription = null,
					tint = MaterialTheme.colorScheme.primary,
					modifier = Modifier.size(16.dp)
				)
				Text(
					text = "Fecha programada: ${fieldTrip.field_trip_scheduled_date}",
					style = MaterialTheme.typography.bodyMedium,
					color = MaterialTheme.colorScheme.onSurfaceVariant
				)
			}

			Row(
				verticalAlignment = Alignment.CenterVertically,
				horizontalArrangement = Arrangement.spacedBy(6.dp)
			) {
				Icon(
					imageVector = Icons.Default.LocationOn,
					contentDescription = null,
					tint = MaterialTheme.colorScheme.secondary,
					modifier = Modifier.size(16.dp)
				)
				Text(
					text = "${fieldTrip.location.province}, ${fieldTrip.location.canton}",
					style = MaterialTheme.typography.bodyMedium,
					color = MaterialTheme.colorScheme.onSurfaceVariant,
					maxLines = 1,
					overflow = TextOverflow.Ellipsis
				)
			}

			Row(
				verticalAlignment = Alignment.CenterVertically,
				horizontalArrangement = Arrangement.spacedBy(6.dp)
			) {
				Icon(
					imageVector = Icons.Default.Person,
					contentDescription = null,
					tint = MaterialTheme.colorScheme.tertiary,
					modifier = Modifier.size(16.dp)
				)
				Text(
					text = "Organizador: ${fieldTrip.creator.first_name} ${fieldTrip.creator.last_name}",
					style = MaterialTheme.typography.bodySmall,
					color = MaterialTheme.colorScheme.onSurfaceVariant,
					maxLines = 1,
					overflow = TextOverflow.Ellipsis
				)
			}
		}
	}
}