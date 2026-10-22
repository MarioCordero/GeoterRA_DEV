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
import ucr.ac.cr.inii.geoterra.presentation.components.common.InfoChip
import ucr.ac.cr.inii.geoterra.presentation.components.common.SectionHeader
import ucr.ac.cr.inii.geoterra.presentation.screens.field.trip.details.FieldTripDetailsState

@Composable
fun FieldTripDetailsContent(
	modifier: Modifier = Modifier,
	isForPdf: Boolean = false,
	state: FieldTripDetailsState
) {
	val scrollState = if (!isForPdf) rememberScrollState() else null
	val verticalSpacing = 16.dp
	val chipSpacing = 8.dp

	state.fieldTrip?.let { fieldTrip ->
		Column(
			modifier = modifier
				.then(
					if (isForPdf) Modifier.width(540.dp).padding(vertical = 32.dp, horizontal = 32.dp) else Modifier.fillMaxSize()
				)
				.then(
					if (scrollState != null) Modifier.verticalScroll(scrollState) else Modifier
				)
		) {
			Row(
				modifier = Modifier.fillMaxWidth(),
				horizontalArrangement = Arrangement.SpaceBetween,
				verticalAlignment = Alignment.CenterVertically
			) {
				Text(
					text = fieldTrip.field_trip_name,
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
				fieldTrip.field_trip_scheduled_date.take(10),
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
					fieldTrip.field_trip_start_date?.take(10) ?: "No definido",
					Modifier.weight(1f).fillMaxHeight(),
					MaterialTheme.colorScheme.secondary
				)
				InfoChip(
					Icons.Default.CalendarToday,
					"Finalización",
					fieldTrip.field_trip_finish_date?.take(10) ?: "No definido",
					Modifier.weight(1f).fillMaxHeight(),
					MaterialTheme.colorScheme.secondary
				)
			}

			Spacer(modifier = Modifier.height(verticalSpacing))

			SectionHeader(title = "Ubicación Geográfica")
			InfoChip(
				Icons.Default.LocationOn,
				"Provincia, Cantón, Distrito",
				"${fieldTrip.location.province}, ${fieldTrip.location.canton}, ${fieldTrip.location.district}",
				Modifier.fillMaxWidth()
			)

			Spacer(modifier = Modifier.height(verticalSpacing))

			SectionHeader(title = "Organizador")
			InfoChip(
				Icons.Default.Person,
				"${fieldTrip.creator.first_name} ${fieldTrip.creator.last_name}",
				fieldTrip.creator.email ?: "Sin correo",
				Modifier.fillMaxWidth(),
				MaterialTheme.colorScheme.primary
			)

			Spacer(modifier = Modifier.height(verticalSpacing))

			SectionHeader(title = "Participantes (${fieldTrip.participants.size})")
			if (fieldTrip.participants.isEmpty()) {
				Text(
					text = "No hay participantes registrados.",
					style = MaterialTheme.typography.bodyMedium,
					color = MaterialTheme.colorScheme.onSurface,
					modifier = Modifier.padding(vertical = 4.dp)
				)
			} else {
				Column(verticalArrangement = Arrangement.spacedBy(chipSpacing)) {
					fieldTrip.participants.forEach { participant ->
						InfoChip(
							Icons.Default.Group,
							"${participant.first_name} ${participant.last_name}",
							participant.email ?: "No especificado",
							Modifier.fillMaxWidth()
						)
					}
				}
			}

			Spacer(modifier = Modifier.height(verticalSpacing))

			SectionHeader(title = "Manifestaciones Geotérmicas (${fieldTrip.geomanifestations.size})")
			if (fieldTrip.geomanifestations.isEmpty()) {
				Text(
					text = "No hay manifestaciones asociadas a esta gira.",
					style = MaterialTheme.typography.bodyMedium,
					color = MaterialTheme.colorScheme.onSurface,
					modifier = Modifier.padding(vertical = 4.dp)
				)
			} else {
				Column(verticalArrangement = Arrangement.spacedBy(chipSpacing)) {
					fieldTrip.geomanifestations.forEach { manifestation ->
						InfoChip(
							Icons.Default.Place,
							manifestation.geomanifestation_name,
							manifestation.description ?: "Sin descripción",
							Modifier.fillMaxWidth(),
							MaterialTheme.colorScheme.secondary,
							maxLines = 10
						)
					}
				}
			}

			Spacer(modifier = Modifier.height(verticalSpacing * 2))

			Text(
				text = "Gira creada el ${fieldTrip.created_at}",
				style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp),
				color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f),
				modifier = Modifier.align(Alignment.CenterHorizontally)
			)

			Spacer(modifier = Modifier.height(verticalSpacing * 4))
		}
	}
}