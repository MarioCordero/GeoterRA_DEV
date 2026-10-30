package ucr.ac.cr.inii.geoterra.presentation.components.insitu

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Assessment
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import ucr.ac.cr.inii.geoterra.data.model.responses.InSituTestResponse


@Composable
public fun InSituTestCardItem(
	test: InSituTestResponse,
	onDetailsClick: () -> Unit
) {
	Row(
		modifier = Modifier
			.fillMaxWidth()
			.background(
				MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
				RoundedCornerShape(16.dp)
			)
			.padding(12.dp),
		verticalAlignment = Alignment.CenterVertically
	) {
		Box(
			modifier = Modifier
				.size(36.dp)
				.background(MaterialTheme.colorScheme.primaryContainer, CircleShape),
			contentAlignment = Alignment.Center
		) {
			Icon(
				imageVector = Icons.Default.Assessment,
				contentDescription = null,
				modifier = Modifier.size(20.dp),
				tint = MaterialTheme.colorScheme.secondary
			)
		}

		Spacer(modifier = Modifier.width(12.dp))

		Column(modifier = Modifier.weight(1f)) {
			Text(
				text = test.insitu_test_name ?: "Prueba In-Situ",
				fontWeight = FontWeight.Bold,
				color = MaterialTheme.colorScheme.onSurface,
				fontSize = 14.sp,
				maxLines = 1,
				overflow = TextOverflow.Ellipsis
			)
			Text(
				text = test.description ?: "Sin descripción registrada",
				color = MaterialTheme.colorScheme.onSurface,
				fontWeight = FontWeight.Normal,
				fontSize = 14.sp,
				maxLines = 2,
				overflow = TextOverflow.Ellipsis
			)
		}

		IconButton(onClick = onDetailsClick) {
			Icon(
				imageVector = Icons.Default.ChevronRight,
				contentDescription = "Ver detalles de la prueba",
				tint = MaterialTheme.colorScheme.primary
			)
		}
	}
}