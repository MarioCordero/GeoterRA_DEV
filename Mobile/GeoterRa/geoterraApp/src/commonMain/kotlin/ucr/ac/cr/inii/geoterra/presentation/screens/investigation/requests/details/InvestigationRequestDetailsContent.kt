package ucr.ac.cr.inii.geoterra.presentation.screens.investigation.requests.details
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.BubbleChart
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Explore
import androidx.compose.material.icons.filled.Group
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.Thermostat
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import ucr.ac.cr.inii.geoterra.data.model.responses.InvestigationRequestResponse
import ucr.ac.cr.inii.geoterra.presentation.components.common.InfoChip
import ucr.ac.cr.inii.geoterra.presentation.components.common.SectionHeader
import ucr.ac.cr.inii.geoterra.presentation.components.request.StatusBadge

@Composable
fun RequestDetailsContent(
	request: InvestigationRequestResponse,
	isForPdf: Boolean = false
) {
	val scrollState = if (!isForPdf) rememberScrollState() else null

	val verticalSpacing = if (isForPdf) 8.dp else 16.dp
	val chipSpacing = if (isForPdf) 4.dp else 8.dp
	val titleSize = if (isForPdf) 18.sp else 22.sp

	Column(
		modifier = Modifier
			.padding(if (isForPdf) 12.dp else 20.dp)
			.then(
				if (isForPdf) Modifier.width(380.dp) else Modifier.fillMaxSize()
			)
			.then(
				if (scrollState != null) Modifier.verticalScroll(scrollState) else Modifier
			),
	) {

		Row(
			modifier = Modifier.fillMaxWidth(),
			horizontalArrangement = Arrangement.SpaceBetween,
			verticalAlignment = Alignment.CenterVertically
		) {
			Text(
				text = request.request_name,
				style = MaterialTheme.typography.titleLarge.copy(
					fontSize = titleSize,
					fontWeight = FontWeight.ExtraBold,
					letterSpacing = (-0.5).sp
				),
				color = MaterialTheme.colorScheme.onSurface,
				modifier = Modifier.weight(1f, fill = false),
				maxLines = 1,
				overflow = TextOverflow.Ellipsis
			)
			StatusBadge(request.current_state.value)
		}

		Spacer(modifier = Modifier.height(verticalSpacing))

		SectionHeader(title = "Ubicación Geográfica")
		InfoChip(
			Icons.Default.LocationOn,
			"Provincia, Cantón, Distrito",
			"${request.location.province}, ${request.location.canton}, ${request.location.district}",
			Modifier.fillMaxWidth()
		)

		Spacer(modifier = Modifier.height(verticalSpacing))

		// --- USO ACTUAL ---
		SectionHeader(title = "Información del Sitio")
		InfoChip(
			Icons.Default.Home,
			"Uso Actual",
			request.current_usage,
			Modifier.fillMaxWidth(),
			MaterialTheme.colorScheme.secondary
		)

		Spacer(modifier = Modifier.height(verticalSpacing))

		// --- RELACIÓN CON EL PROPIETARIO ---
		SectionHeader(title = "Relación con el Propietario")
		InfoChip(
			Icons.Default.Group,
			"Tipo de Relación",
			request.relation_with_owner,
			Modifier.fillMaxWidth(),
			MaterialTheme.colorScheme.primary
		)

		Spacer(modifier = Modifier.height(verticalSpacing))

		// --- PROPIETARIO ---
		SectionHeader(title = "Información del Propietario")
		InfoChip(
			Icons.Default.Person,
			"Nombre Completo",
			request.owner_name ?: "No especificado",
			Modifier.fillMaxWidth(),
			MaterialTheme.colorScheme.primary
		)

		Spacer(modifier = Modifier.height(chipSpacing))

		InfoChip(
			Icons.Default.Phone,
			"Teléfono",
			request.owner_phone_number ?: "No especificado",
			Modifier.fillMaxWidth(),
			MaterialTheme.colorScheme.secondary
		)

		Spacer(modifier = Modifier.height(chipSpacing))

		InfoChip(
			Icons.Default.Email,
			"Correo Electrónico",
			request.owner_email ?: "No especificado",
			Modifier.fillMaxWidth(),
			MaterialTheme.colorScheme.primary
		)

		Spacer(modifier = Modifier.height(verticalSpacing))

		// --- OBSERVACIONES ---
		SectionHeader(title = "Observaciones Físicas")
		Row(
			modifier = Modifier
				.fillMaxWidth()
				.height(IntrinsicSize.Max),
			horizontalArrangement = Arrangement.spacedBy(chipSpacing)
		) {
			InfoChip(
				Icons.Default.Thermostat, "Sensación Térmica",
				request.temperature_sensation,
				Modifier
					.weight(1f)
					.fillMaxHeight(),
				MaterialTheme.colorScheme.primary
			)
			InfoChip(
				Icons.Default.BubbleChart, "Burbujas",
				if (request.bubbles) "Sí" else "No",
				Modifier
					.weight(1f)
					.fillMaxHeight(),
				MaterialTheme.colorScheme.secondary
			)
		}

		Spacer(modifier = Modifier.height(chipSpacing))

		InfoChip(
			Icons.Default.Description,
			"Detalles Adicionales", request.details.ifBlank { "No especificado" },
			Modifier.fillMaxWidth(),
			MaterialTheme.colorScheme.secondary
		)

		Spacer(modifier = Modifier.height(verticalSpacing))

		// --- SITIO ---
		SectionHeader(title = "Ubicación Exacta")
		InfoChip(
			Icons.Default.Description,
			"Dirección Exacta", request.exact_address.ifBlank { "No especificado" },
			Modifier.fillMaxWidth()
		)

		Spacer(modifier = Modifier.height(chipSpacing))

		Row(
			modifier = Modifier
				.fillMaxWidth()
				.height(IntrinsicSize.Max),
			horizontalArrangement = Arrangement.spacedBy(chipSpacing),
		) {
			InfoChip(
				Icons.Default.Explore,
				"Latitud",
				request.location.latitude.toString(),
				Modifier
					.weight(1f)
					.fillMaxHeight(),
				MaterialTheme.colorScheme.secondary
			)
			InfoChip(
				Icons.Default.Explore,
				"Longitud",
				request.location.longitude.toString(),
				Modifier
					.weight(1f)
					.fillMaxHeight(),
				MaterialTheme.colorScheme.secondary
			)
		}

		Spacer(modifier = Modifier.height(verticalSpacing))

		// --- PIE DE PÁGINA ---
		Text(
			text = "Solicitud creada el ${request.created_at}",
			style = MaterialTheme.typography.labelSmall.copy(fontSize = if (isForPdf) 8.sp else 10.sp),
			color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f),
			modifier = Modifier.align(Alignment.CenterHorizontally)
		)

		if (isForPdf) {
			Spacer(modifier = Modifier.height(8.dp))
			Text(
				modifier = Modifier.align(Alignment.CenterHorizontally),
				text = "© 2021 Instituto de Investigaciones en Ingeniería - UCR",
				style = MaterialTheme.typography.labelSmall,
				color = Color.Gray
			)
		}

		// Espacio extra al final para que el FAB no tape el contenido al scrollear
		if (!isForPdf) {
			Spacer(modifier = Modifier.height(80.dp))
		}
	}
}