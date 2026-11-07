package ucr.ac.cr.inii.geoterra.presentation.components.common

import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun SectionHeader(
	title: String,
	icon: ImageVector? = null,
	modifier: Modifier = Modifier.padding(bottom = 12.dp)
) {
	Row(
		verticalAlignment = Alignment.CenterVertically,
		modifier = modifier
	) {
		if (icon != null) {
			Icon(
				icon,
				contentDescription = null,
				modifier = Modifier.size(18.dp),
				tint = MaterialTheme.colorScheme.primary
			)
			Spacer(Modifier.width(8.dp))
		}
		Text(
			text = title,
			style = MaterialTheme.typography.titleMedium.copy(
				fontWeight = FontWeight.Bold,
				fontSize = 18.sp
			),
			color = MaterialTheme.colorScheme.onSurface
		)
	}
}