package ucr.ac.cr.inii.geoterra.presentation.components.manifestation

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp


@Composable
fun ChemicalGroupCard(
	title: String,
	color: Color,
	elements: List<Pair<String, Double?>>
) {
	Card(
		modifier = Modifier.fillMaxWidth(),
		shape = RoundedCornerShape(16.dp),
		colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
		border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant)
	) {
		Column(modifier = Modifier.padding(16.dp)) {
			Text(
				text = title,
				style = MaterialTheme.typography.titleMedium,
				fontWeight = FontWeight.Bold,
				color = color
			)
			Spacer(modifier = Modifier.height(12.dp))

			elements.forEach { (label, value) ->
				ChemicalRow(label, value)
			}
		}
	}
}