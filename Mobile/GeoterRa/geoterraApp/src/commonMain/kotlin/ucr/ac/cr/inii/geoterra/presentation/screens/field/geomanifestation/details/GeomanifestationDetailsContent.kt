package ucr.ac.cr.inii.geoterra.presentation.screens.field.geomanifestation.details

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import ucr.ac.cr.inii.geoterra.presentation.components.common.DataBox
import ucr.ac.cr.inii.geoterra.presentation.components.common.InfoChip
import ucr.ac.cr.inii.geoterra.presentation.components.common.SectionHeader
import ucr.ac.cr.inii.geoterra.presentation.components.geomanifestation.ChemicalGroupCard
import ucr.ac.cr.inii.geoterra.presentation.components.insitu.InSituTestCardItem

@Composable
fun GeomanifestationDetailsContent(
	modifier: Modifier = Modifier,
	state: GeomanifestationDetailsState,
	onInSituTestClick: ((String) -> Unit)? = null
) {
	val scrollState = rememberScrollState()

	state.geomanifestation?.let { manifestation ->
		Column(
			modifier = modifier
				.fillMaxSize()
				.verticalScroll(scrollState),
			verticalArrangement = Arrangement.spacedBy(16.dp)
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
					maxLines = 2,
					overflow = TextOverflow.Ellipsis
				)
			}

			Row(verticalAlignment = Alignment.CenterVertically) {
				Icon(
					Icons.Default.Terrain,
					contentDescription = null,
					modifier = Modifier.size(18.dp),
					tint = MaterialTheme.colorScheme.primary
				)
				Spacer(Modifier.width(8.dp))
				Text(
					text = "Información General",
					style = MaterialTheme.typography.titleLarge,
					fontWeight = FontWeight.Bold,
					color = MaterialTheme.colorScheme.primary
				)
			}

			Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
				SectionHeader("Ubicación Geográfica")
				InfoChip(
					icon = Icons.Default.LocationOn,
					label = "${manifestation.location.province}, ${manifestation.location.canton}, ${manifestation.location.district}",
					value = "Lat: ${manifestation.location.latitude} | Lon: ${manifestation.location.longitude}",
					modifier = Modifier.fillMaxWidth()
				)

				SectionHeader("Descripción / Detalles")
				Surface(
					modifier = Modifier.fillMaxWidth(),
					shape = RoundedCornerShape(16.dp),
					color = MaterialTheme.colorScheme.surface,
					border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant)
				) {
					Text(
						text = manifestation.description ?: "Sin descripción registrada.",
						style = MaterialTheme.typography.bodyLarge,
						color = MaterialTheme.colorScheme.onSurface,
						modifier = Modifier.padding(16.dp)
					)
				}
			}

			Row(verticalAlignment = Alignment.CenterVertically) {
				Icon(
					Icons.Default.Assessment,
					contentDescription = null,
					modifier = Modifier.size(18.dp),
					tint = MaterialTheme.colorScheme.primary
				)
				Spacer(Modifier.width(8.dp))
				Text(
					text = "Pruebas de Campo (In-Situ)",
					style = MaterialTheme.typography.titleLarge,
					fontWeight = FontWeight.Bold,
					color = MaterialTheme.colorScheme.primary
				)
			}

			if (state.inSituTests.isEmpty()) {
				Text(
					text = "No se registraron pruebas de campo asociadas a esta manifestación.",
					style = MaterialTheme.typography.bodyMedium,
					color = MaterialTheme.colorScheme.onSurfaceVariant
				)
			} else {
				Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
					state.inSituTests.forEach { test ->
						InSituTestCardItem(
							test = test,
							onDetailsClick = { onInSituTestClick?.invoke(test.insitu_test_id) }
						)
					}
				}
			}

			// Sección 3: Análisis de Laboratorio
			Row(verticalAlignment = Alignment.CenterVertically) {
				Icon(
					Icons.Default.Science,
					contentDescription = null,
					modifier = Modifier.size(18.dp),
					tint = MaterialTheme.colorScheme.primary
				)
				Spacer(Modifier.width(8.dp))
				Text(
					text = "Análisis de Laboratorio",
					style = MaterialTheme.typography.titleLarge,
					fontWeight = FontWeight.Bold,
					color = MaterialTheme.colorScheme.primary
				)
			}

			if (manifestation.inlab_test == null) {
				Text(
					text = "No se registraron análisis químicos de laboratorio.",
					style = MaterialTheme.typography.bodyMedium,
					color = MaterialTheme.colorScheme.onSurfaceVariant
				)
			} else {
				val lab = manifestation.inlab_test
				Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
					SectionHeader("Detalles del Laboratorio")
					Surface(
						modifier = Modifier.fillMaxWidth(),
						shape = RoundedCornerShape(16.dp),
						color = MaterialTheme.colorScheme.surface,
						border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant)
					) {
						Text(
							text = lab.description ?: "Sin observaciones adicionales.",
							style = MaterialTheme.typography.bodyLarge,
							color = MaterialTheme.colorScheme.onSurface,
							modifier = Modifier.padding(16.dp)
						)
					}

					SectionHeader("Mediciones Físico-Químicas")
					Row(
						modifier = Modifier.fillMaxWidth(),
						horizontalArrangement = Arrangement.spacedBy(8.dp)
					) {
						DataBox(
							modifier = Modifier.weight(1f),
							label = "pH Laboratorio",
							value = "${lab.ph ?: "--"}",
							icon = Icons.Default.Opacity,
							color = Color(0xFF2196F3)
						)
						DataBox(
							modifier = Modifier.weight(1f),
							label = "Conductividad",
							value = "${lab.conductivity ?: "--"} µS/cm",
							icon = Icons.Default.ElectricBolt,
							color = Color(0xFF4CAF50)
						)
					}

					SectionHeader("Composición Química")
					ChemicalGroupCard(
						title = "Cationes Principales",
						color = Color(0xFFE91E63),
						elements = listOf(
							"Sodio (Na)" to lab.na,
							"Potasio (K)" to lab.k,
							"Calcio (Ca)" to lab.ca,
							"Magnesio (Mg)" to lab.mg,
							"Hierro (Fe)" to lab.fe,
							"Litio (Li)" to lab.li
						)
					)

					ChemicalGroupCard(
						title = "Aniones y Otros",
						color = Color(0xFF00BCD4),
						elements = listOf(
							"Cloro (Cl)" to lab.cl,
							"Sulfatos (SO4)" to lab.so4,
							"Bicarbonato (HCO3)" to lab.hco3,
							"Flúor (F)" to lab.f,
							"Boro (B)" to lab.b,
							"Sílice (SiO2)" to lab.si
						)
					)
				}
			}

			Spacer(modifier = Modifier.height(8.dp))

			Text(
				text = "Manifestación registrada el ${manifestation.created_at.take(10)}",
				style = MaterialTheme.typography.labelSmall,
				color = MaterialTheme.colorScheme.onSurfaceVariant,
				modifier = Modifier.align(Alignment.CenterHorizontally)
			)

			Spacer(modifier = Modifier.height(32.dp))
		}
	}
}