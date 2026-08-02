package ucr.ac.cr.inii.geoterra.presentation.screens.map.geomanifestation

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ElectricBolt
import androidx.compose.material.icons.filled.Opacity
import androidx.compose.material.icons.filled.Science
import androidx.compose.material.icons.filled.Terrain
import androidx.compose.material.icons.filled.Thermostat
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.onGloballyPositioned
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.IntSize
import androidx.compose.ui.unit.dp
import ucr.ac.cr.inii.geoterra.data.model.responses.GeomanifestationResponse
import ucr.ac.cr.inii.geoterra.presentation.components.common.DataBox
import ucr.ac.cr.inii.geoterra.presentation.components.common.SectionHeader
import ucr.ac.cr.inii.geoterra.presentation.components.manifestation.ChemicalGroupCard

@Composable
fun GeomanifestationContent(
	modifier: Modifier = Modifier,
	manifestation: GeomanifestationResponse,
	isForPdf: Boolean = false,
	onSizeMeasured: ((IntSize) -> Unit)? = null
) {
	val scrollState = if (!isForPdf) rememberScrollState() else null

	Column(
		modifier = modifier
			.then(
				if (isForPdf) Modifier.width(540.dp)
					.padding(vertical = 32.dp, horizontal = 32.dp) else Modifier.fillMaxSize()
			)
			.then(
				if (scrollState != null) Modifier.verticalScroll(scrollState) else Modifier
			)
			.onGloballyPositioned { coordinates ->
				onSizeMeasured?.invoke(coordinates.size)
			},
		verticalArrangement = Arrangement.spacedBy(16.dp),

		) {
		Row(
			modifier = Modifier.fillMaxWidth(),
			horizontalArrangement = Arrangement.SpaceBetween,
			verticalAlignment = Alignment.CenterVertically
		) {
			Text(
				text = manifestation.name,
				style = MaterialTheme.typography.headlineLarge.copy(
					fontWeight = FontWeight.Bold,
				),
				color = MaterialTheme.colorScheme.onSurface,
				modifier = Modifier.weight(1f),
				maxLines = 2,
				overflow = TextOverflow.Ellipsis
			)
		}

		Row(
			verticalAlignment = Alignment.CenterVertically
		) {
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
				color = MaterialTheme.colorScheme.primary,
			)
		}

		Column {
			SectionHeader("Descripción/Detalles")
			Surface(
				modifier = Modifier.fillMaxWidth(),
				shape = RoundedCornerShape(16.dp),
				color = MaterialTheme.colorScheme.surface,
				border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant)
			) {
				Row(
					modifier = Modifier.padding(16.dp).fillMaxWidth(),
					verticalAlignment = Alignment.CenterVertically
				) {
					Text(
						text = manifestation.current_georeport?.details ?: "No especificado.",
						style = MaterialTheme.typography.bodyLarge,
						color = MaterialTheme.colorScheme.onSurface,
					)
				}
			}
		}

		Spacer(modifier = Modifier.height(4.dp))

		Row(
			verticalAlignment = Alignment.CenterVertically
		) {
			Icon(
				Icons.Default.Terrain,
				contentDescription = null,
				modifier = Modifier.size(18.dp),
				tint = MaterialTheme.colorScheme.primary
			)
			Spacer(Modifier.width(8.dp))
			Text(
				text = "Análisis de Campo",
				style = MaterialTheme.typography.titleLarge,
				fontWeight = FontWeight.Bold,
				color = MaterialTheme.colorScheme.primary,
			)
		}

		Column {
			SectionHeader("Detalles del Análisis")
			Surface(
				modifier = Modifier.fillMaxWidth(),
				shape = RoundedCornerShape(16.dp),
				color = MaterialTheme.colorScheme.surface,
				border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant)
			) {
				Row(
					modifier = Modifier.padding(16.dp).fillMaxWidth(),
					verticalAlignment = Alignment.CenterVertically
				) {
					Text(
						text = manifestation.insitu_test?.description ?: "No especificado.",
						style = MaterialTheme.typography.bodyLarge,
						color = MaterialTheme.colorScheme.onSurface,
					)
				}
			}
		}

		Column {
			SectionHeader("Parámetros Físicos")

			Column {
				Row(
					modifier = Modifier.fillMaxWidth(),
					horizontalArrangement = Arrangement.spacedBy(8.dp)
				) {
					DataBox(
						Modifier.weight(1f), "Temperatura",
						"${manifestation.insitu_test?.temperature ?: "--"}°C",
						Icons.Default.Thermostat, Color(0xFFFF5722)
					)
					DataBox(
						Modifier.weight(1f), "pH",
						"${manifestation.insitu_test?.ph ?: "--"}",
						Icons.Default.Opacity, Color(0xFF2196F3)
					)
				}
				Spacer(modifier = Modifier.height(8.dp))
				DataBox(
					Modifier.fillMaxWidth(), "Conductividad Eléctrica",
					"${manifestation.insitu_test?.conductivity ?: "--"} µS/cm",
					Icons.Default.ElectricBolt, Color(0xFF4CAF50)
				)
			}
		}

		Spacer(modifier = Modifier.height(4.dp))

		Row(
			verticalAlignment = Alignment.CenterVertically
		) {
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
				color = MaterialTheme.colorScheme.primary,
			)
		}

		Column {
			SectionHeader("Detalles del Análisis")
			Surface(
				modifier = Modifier.fillMaxWidth(),
				shape = RoundedCornerShape(16.dp),
				color = MaterialTheme.colorScheme.surface,
				border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant)
			) {
				Row(
					modifier = Modifier.padding(16.dp).fillMaxWidth(),
					verticalAlignment = Alignment.CenterVertically
				) {
					Text(
						text = manifestation.inlab_test?.description ?: "No especificado.",
						style = MaterialTheme.typography.bodyLarge,
						color = MaterialTheme.colorScheme.onSurface,
					)
				}
			}
		}

		Column {
			SectionHeader("Parámetros Físicos")
			Column {
				DataBox(
					Modifier.fillMaxWidth(), "pH",
					"${manifestation.inlab_test?.ph ?: "--"}",
					Icons.Default.Opacity, Color(0xFF2196F3)
				)
				Spacer(modifier = Modifier.height(8.dp))
				DataBox(
					Modifier.fillMaxWidth(), "Conductividad Eléctrica",
					"${manifestation.inlab_test?.conductivity ?: "--"} µS/cm",
					Icons.Default.ElectricBolt, Color(0xFF4CAF50)
				)
			}
		}

		Column {
			SectionHeader("Propiedades Químicas")

			// Cations
			ChemicalGroupCard(
				title = "Cationes Principales",
				color = Color(0xFFE91E63),
				elements = listOf(
					"Sodio (Na)" to manifestation.inlab_test?.na,
					"Potasio (K)" to manifestation.inlab_test?.k,
					"Calcio (Ca)" to manifestation.inlab_test?.ca,
					"Magnesio (Mg)" to manifestation.inlab_test?.mg,
					"Hierro (Fe)" to manifestation.inlab_test?.fe,
					"Litio (Li)" to manifestation.inlab_test?.li
				)
			)

			Spacer(modifier = Modifier.height(16.dp))

			// Anions
			ChemicalGroupCard(
				title = "Aniones y Otros",
				color = Color(0xFF00BCD4),
				elements = listOf(
					"Cloro (Cl)" to manifestation.inlab_test?.cl,
					"Sulfatos (SO4)" to manifestation.inlab_test?.so4,
					"Bicarbonato (HCO3)" to manifestation.inlab_test?.hco3,
					"Flúor (F)" to manifestation.inlab_test?.f,
					"Boro (B)" to manifestation.inlab_test?.b,
					"Sílice (SiO2)" to manifestation.inlab_test?.si
				)
			)
		}

		Text(
			modifier = Modifier.align(Alignment.CenterHorizontally),
			text = "Reporte realizado el ${manifestation.created_at.take(10)}",
			style = MaterialTheme.typography.labelSmall,
			color = Color.Gray
		)

		if (isForPdf) {
			Text(
				modifier = Modifier.align(Alignment.CenterHorizontally),
				text = "© 2021 Instituto de Investigaciones en Ingeniería - UCR",
				style = MaterialTheme.typography.labelSmall,
				color = Color.Gray
			)
		}

		Spacer(modifier = Modifier.height(32.dp))
	}
//
//	// Othewr
//	Column(
//		modifier = modifier
//			.fillMaxSize()
//			.verticalScroll(rememberScrollState())
//	) {
//
//		ManifestationReport(
//			manifestation = manifestation,
//			isForPdf = false
//		)
//
//		Spacer(modifier = Modifier.height(32.dp))
//	}
}
