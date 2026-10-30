package ucr.ac.cr.inii.geoterra.presentation.screens.field.geomanifestation.details

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.Explore
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import ucr.ac.cr.inii.geoterra.presentation.components.common.InfoChip
import ucr.ac.cr.inii.geoterra.presentation.components.common.SectionHeader
import ucr.ac.cr.inii.geoterra.presentation.components.insitu.InSituTestDetails

@Composable
fun GeomanifestationDetailsContent(
	modifier: Modifier = Modifier,
	state: GeomanifestationDetailsState,
	onInSituTestClick: ((String) -> Unit)? = null,
	isForPdf: Boolean = false
) {
	val scrollState = if (!isForPdf) rememberScrollState() else null

	val verticalSpacing = 16.dp
	val chipSpacing = 8.dp

	state.geomanifestation?.let { manifestation ->
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
					text = manifestation.geomanifestation_name,
					style = MaterialTheme.typography.headlineLarge.copy(
						fontWeight = FontWeight.Bold
					),
					color = MaterialTheme.colorScheme.onSurface,
					modifier = Modifier.weight(1f),
					maxLines = 6,
					overflow = TextOverflow.Ellipsis
				)
			}

			Spacer(modifier = Modifier.height(verticalSpacing))

			SectionHeader("Ubicación Geográfica")
			InfoChip(
				Icons.Default.LocationOn,
				"Provincia, Cantón, Distrito",
				"${manifestation.location.province}, ${manifestation.location.canton}, ${manifestation.location.district}",
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
					manifestation.location.latitude.toString(),
					Modifier
						.weight(1f)
						.fillMaxHeight(),
					MaterialTheme.colorScheme.secondary
				)
				InfoChip(
					Icons.Default.Explore,
					"Longitud",
					manifestation.location.longitude.toString(),
					Modifier
						.weight(1f)
						.fillMaxHeight(),
					MaterialTheme.colorScheme.secondary
				)
			}

			Spacer(modifier = Modifier.height(verticalSpacing))

			SectionHeader("Detalles Adicionales")
			InfoChip(
				Icons.Default.Description,
				"Descripción",
				manifestation.description ?: "Sin descripción registrada.",
				Modifier.fillMaxWidth(),
				maxLines = 5
			)

			Spacer(modifier = Modifier.height(verticalSpacing))

			SectionHeader("Pruebas de Campo (${state.inSituTests.size})")
			if (state.inSituTests.isEmpty()) {
				Text(
					text = "No se registraron pruebas de campo asociadas a esta geomanifestación.",
					style = MaterialTheme.typography.bodyMedium,
					color = MaterialTheme.colorScheme.onSurfaceVariant,
					modifier = Modifier.padding(vertical = 8.dp)
				)
			} else {
				Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
					state.inSituTests.forEach { test ->
						InSituTestDetails(
							test = test,
							isForPdf = isForPdf
						)
					}
				}
			}

			Spacer(modifier = Modifier.height(verticalSpacing))

			// --- PIE DE PÁGINA ---
			Text(
				text = "Geomanifestación creada el ${manifestation.created_at}",
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
}