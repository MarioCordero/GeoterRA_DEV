package ucr.ac.cr.inii.geoterra.presentation.screens.investigation.requests.details
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
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
import androidx.compose.ui.layout.onGloballyPositioned
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.IntSize
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import ucr.ac.cr.inii.geoterra.data.model.responses.InvestigationRequestResponse
import ucr.ac.cr.inii.geoterra.presentation.components.common.InfoChip
import ucr.ac.cr.inii.geoterra.presentation.components.common.SectionHeader
import ucr.ac.cr.inii.geoterra.presentation.components.request.StatusBadge
import ucr.ac.cr.inii.geoterra.presentation.components.request.StatusHistoryChip

@Composable
fun InvestigationRequestDetailsContent(
	modifier: Modifier = Modifier,
	state: InvestigationRequestDetailsState,
	isForPdf: Boolean = false,
	onSizeMeasured: ((IntSize) -> Unit)? = null
) {
	val scrollState = if (!isForPdf) rememberScrollState() else null

	val verticalSpacing = 16.dp
	val chipSpacing = 8.dp

	Column(
		modifier = modifier
			.then(
				if (isForPdf) Modifier.width(540.dp).padding(vertical = 32.dp, horizontal = 32.dp) else Modifier.fillMaxSize()
			)
			.then(
				if (scrollState != null) Modifier.verticalScroll(scrollState) else Modifier
			)
			.onGloballyPositioned { coordinates ->
				onSizeMeasured?.invoke(coordinates.size)
			},
	) {

		Row(
			modifier = Modifier.fillMaxWidth(),
			horizontalArrangement = Arrangement.SpaceBetween,
			verticalAlignment = Alignment.CenterVertically
		) {
			Text(
				text = state.request.request_name,
				style = MaterialTheme.typography.headlineLarge.copy(
					fontWeight = FontWeight.Bold,
				),
				color = MaterialTheme.colorScheme.onSurface,
				modifier = Modifier.weight(1f, fill = false),
				maxLines = 2,
				overflow = TextOverflow.Ellipsis
			)
		}

		Spacer(modifier = Modifier.height(verticalSpacing))

		SectionHeader(title = "Ubicación Geográfica")
		InfoChip(
			Icons.Default.LocationOn,
			"Provincia, Cantón, Distrito",
			"${state.request.location.province}, ${state.request.location.canton}, ${state.request.location.district}",
			Modifier.fillMaxWidth()
		)

		Spacer(modifier = Modifier.height(verticalSpacing))

		// --- USO ACTUAL ---
		SectionHeader(title = "Información del Sitio")
		InfoChip(
			Icons.Default.Home,
			"Uso Actual",
			state.request.current_usage,
			Modifier.fillMaxWidth(),
			MaterialTheme.colorScheme.secondary
		)

		Spacer(modifier = Modifier.height(verticalSpacing))

		// --- RELACIÓN CON EL PROPIETARIO ---
		SectionHeader(title = "Relación con el Propietario")
		InfoChip(
			Icons.Default.Group,
			"Tipo de Relación",
			state.request.relation_with_owner,
			Modifier.fillMaxWidth(),
			MaterialTheme.colorScheme.primary
		)

		Spacer(modifier = Modifier.height(verticalSpacing))

		// --- PROPIETARIO ---
		SectionHeader(title = "Información del Propietario")
		InfoChip(
			Icons.Default.Person,
			"Nombre Completo",
			state.request.owner_name ?: "No especificado",
			Modifier.fillMaxWidth(),
			MaterialTheme.colorScheme.primary
		)

		Spacer(modifier = Modifier.height(chipSpacing))

		InfoChip(
			Icons.Default.Phone,
			"Teléfono",
			state.request.owner_phone_number ?: "No especificado",
			Modifier.fillMaxWidth(),
			MaterialTheme.colorScheme.secondary
		)

		Spacer(modifier = Modifier.height(chipSpacing))

		InfoChip(
			Icons.Default.Email,
			"Correo Electrónico",
			state.request.owner_email ?: "No especificado",
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
				state.request.temperature_sensation,
				Modifier
					.weight(1f)
					.fillMaxHeight(),
				MaterialTheme.colorScheme.primary
			)
			InfoChip(
				Icons.Default.BubbleChart, "Burbujas",
				if (state.request.bubbles) "Sí" else "No",
				Modifier
					.weight(1f)
					.fillMaxHeight(),
				MaterialTheme.colorScheme.secondary
			)
		}

		Spacer(modifier = Modifier.height(chipSpacing))

		InfoChip(
			Icons.Default.Description,
			"Detalles Adicionales", state.request.details.ifBlank { "No especificado" },
			Modifier.fillMaxWidth(),
			MaterialTheme.colorScheme.secondary
		)

		Spacer(modifier = Modifier.height(verticalSpacing))

		// --- SITIO ---
		SectionHeader(title = "Ubicación Exacta")
		InfoChip(
			Icons.Default.Description,
			"Dirección Exacta", state.request.exact_address.ifBlank { "No especificado" },
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
				state.request.location.latitude.toString(),
				Modifier
					.weight(1f)
					.fillMaxHeight(),
				MaterialTheme.colorScheme.secondary
			)
			InfoChip(
				Icons.Default.Explore,
				"Longitud",
				state.request.location.longitude.toString(),
				Modifier
					.weight(1f)
					.fillMaxHeight(),
				MaterialTheme.colorScheme.secondary
			)
		}

		Spacer(modifier = Modifier.height(verticalSpacing))

		SectionHeader(title = "Historial de Estados")

		if (state.isLoading && state.statuses.isEmpty()) {
			Box(modifier = Modifier.fillMaxWidth().padding(16.dp), contentAlignment = Alignment.Center) {
				CircularProgressIndicator(modifier = Modifier.size(24.dp))
			}
		} else if (state.statuses.isEmpty()) {
			Text(
				text = "No hay historial disponible",
				style = MaterialTheme.typography.bodyMedium,
				modifier = Modifier.padding(vertical = 8.dp)
			)
		} else {
			Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
				state.statuses.forEach { statusResponse ->
					StatusHistoryChip(
						statusValue = statusResponse.value,
						createdAt = statusResponse.created_at,
						description = statusResponse.description,
					)
				}
			}
		}

		Spacer(modifier = Modifier.height(verticalSpacing))

		// --- PIE DE PÁGINA ---
		Text(
			text = "Solicitud creada el ${state.request.created_at}",
			style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp),
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

		if (!isForPdf) {
			Spacer(modifier = Modifier.height(verticalSpacing * 7))
		}
	}
}