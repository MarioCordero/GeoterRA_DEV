package ucr.ac.cr.inii.geoterra.presentation.screens.fieldtrip.details

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CalendarToday
import androidx.compose.material.icons.filled.Group
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Place
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import ucr.ac.cr.inii.geoterra.data.model.responses.FieldTripResponse
import ucr.ac.cr.inii.geoterra.presentation.components.common.InfoChip
import ucr.ac.cr.inii.geoterra.presentation.components.common.SectionHeader
import ucr.ac.cr.inii.geoterra.presentation.screens.field.trip.details.FieldTripDetailsState

@Composable
fun FieldTripDetailsContent(
	modifier: Modifier = Modifier,
	state: FieldTripDetailsState
) {
	val scrollState = rememberScrollState()
	val verticalSpacing = 16.dp
	val chipSpacing = 8.dp

	Column(
		modifier = modifier
			.fillMaxSize()
			.verticalScroll(scrollState)
	) {
		Row(
			modifier = Modifier.fillMaxWidth(),
			horizontalArrangement = Arrangement.SpaceBetween,
			verticalAlignment = Alignment.CenterVertically
		) {
			Text(
				text = state.fieldTrip.field_trip_name,
				style = MaterialTheme.typography.headlineLarge.copy(
					fontWeight = FontWeight.Bold
				),
				color = MaterialTheme.colorScheme.onSurface,
				modifier = Modifier.weight(1f, fill = false),
				maxLines = 2,
				overflow = TextOverflow.Ellipsis
			)
		}

		Spacer(modifier = Modifier.height(verticalSpacing))

		SectionHeader(title = "Estado y Fechas")
		InfoChip(
			Icons.Default.CalendarToday,
			"Fecha Programada",
			state.fieldTrip.field_trip_scheduled_date,
			Modifier.fillMaxWidth(),
			MaterialTheme.colorScheme.primary
		)

		Spacer(modifier = Modifier.height(chipSpacing))

		Row(
			modifier = Modifier
				.fillMaxWidth()
				.height(IntrinsicSize.Max),
			horizontalArrangement = Arrangement.spacedBy(chipSpacing)
		) {
			InfoChip(
				Icons.Default.CalendarToday,
				"Inicio",
				state.fieldTrip.field_trip_start_date ?: "No definido",
				Modifier.weight(1f).fillMaxHeight(),
				MaterialTheme.colorScheme.secondary
			)
			InfoChip(
				Icons.Default.CalendarToday,
				"Finalización",
				state.fieldTrip.field_trip_finish_date ?: "No definido",
				Modifier.weight(1f).fillMaxHeight(),
				MaterialTheme.colorScheme.secondary
			)
		}

		Spacer(modifier = Modifier.height(verticalSpacing))

		SectionHeader(title = "Ubicación Geográfica")
		InfoChip(
			Icons.Default.LocationOn,
			"Provincia, Cantón, Distrito",
			"${state.fieldTrip.location.province}, ${state.fieldTrip.location.canton}, ${state.fieldTrip.location.district}",
			Modifier.fillMaxWidth()
		)

		Spacer(modifier = Modifier.height(verticalSpacing))

		SectionHeader(title = "Organizador")
		InfoChip(
			Icons.Default.Person,
			"Creado por",
			"${state.fieldTrip.creator.first_name} ${state.fieldTrip.creator.last_name} (${state.fieldTrip.creator.email})",
			Modifier.fillMaxWidth(),
			MaterialTheme.colorScheme.primary
		)

		Spacer(modifier = Modifier.height(verticalSpacing))

		SectionHeader(title = "Participantes (${state.fieldTrip.participants.size})")
		if (state.fieldTrip.participants.isEmpty()) {
			Text(
				text = "No hay participantes registrados.",
				style = MaterialTheme.typography.bodyMedium,
				color = MaterialTheme.colorScheme.onSurfaceVariant,
				modifier = Modifier.padding(vertical = 4.dp)
			)
		} else {
			Column(verticalArrangement = Arrangement.spacedBy(chipSpacing)) {
				state.fieldTrip.participants.forEach { participant ->
					InfoChip(
						Icons.Default.Group,
						"${participant.first_name} ${participant.last_name}",
						participant.email,
						Modifier.fillMaxWidth()
					)
				}
			}
		}

		Spacer(modifier = Modifier.height(verticalSpacing))

		SectionHeader(title = "Manifestaciones Geotérmicas (${state.fieldTrip.geomanifestations.size})")
		if (state.fieldTrip.geomanifestations.isEmpty()) {
			Text(
				text = "No hay manifestaciones asociadas a esta gira.",
				style = MaterialTheme.typography.bodyMedium,
				color = MaterialTheme.colorScheme.onSurfaceVariant,
				modifier = Modifier.padding(vertical = 4.dp)
			)
		} else {
			Column(verticalArrangement = Arrangement.spacedBy(chipSpacing)) {
				state.fieldTrip.geomanifestations.forEach { manifestation ->
					InfoChip(
						Icons.Default.Place,
						manifestation.geomanifestation_name,
						manifestation.description ?: "Sin descripción",
						Modifier.fillMaxWidth(),
						MaterialTheme.colorScheme.secondary
					)
				}
			}
		}

		Spacer(modifier = Modifier.height(verticalSpacing * 2))

		Text(
			text = "Gira creada el ${state.fieldTrip.created_at}",
			style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp),
			color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f),
			modifier = Modifier.align(Alignment.CenterHorizontally)
		)

		Spacer(modifier = Modifier.height(verticalSpacing * 4))
	}
}