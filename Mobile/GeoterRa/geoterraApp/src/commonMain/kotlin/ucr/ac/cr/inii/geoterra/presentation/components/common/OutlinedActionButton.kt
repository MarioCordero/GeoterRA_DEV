package ucr.ac.cr.inii.geoterra.presentation.components.common

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun OutlinedActionButton(
	isLoading: Boolean = false,
	text: String,
	onClick: () -> Unit,
	modifier: Modifier = Modifier,
	isCompact: Boolean = false
) {
	val buttonHeight = if (isCompact) 44.dp else 58.dp
	val buttonShape = RoundedCornerShape(if (isCompact) 12.dp else 16.dp)
	val contentPadding =
		if (isCompact) PaddingValues(horizontal = 4.dp) else ButtonDefaults.ContentPadding

	val borderColor =
		if (isCompact) MaterialTheme.colorScheme.outlineVariant else MaterialTheme.colorScheme.outline

	val finalModifier =
		if (isCompact) modifier.height(buttonHeight) else modifier.fillMaxWidth().height(buttonHeight)

	OutlinedButton(
		onClick = onClick,
		modifier = finalModifier,
		shape = buttonShape,
		border = BorderStroke(1.dp, borderColor),
		enabled = !isLoading,
		contentPadding = contentPadding,
		colors = ButtonDefaults.outlinedButtonColors(
			contentColor = MaterialTheme.colorScheme.onSurface
		),
		elevation = ButtonDefaults.buttonElevation(
			defaultElevation = 0.dp,
			pressedElevation = 2.dp,
			hoveredElevation = 1.dp
		)
	) {
		if (isLoading) {
			CircularProgressIndicator(
				modifier = Modifier.size(if (isCompact) 20.dp else 24.dp),
				color = borderColor,
				strokeWidth = if (isCompact) 2.dp else 3.dp
			)
		} else {
			Row(
				verticalAlignment = Alignment.CenterVertically,
				horizontalArrangement = Arrangement.spacedBy(8.dp)
			) {
				Text(
					text = text,
					style = if (isCompact) {
						MaterialTheme.typography.labelLarge
					} else {
						MaterialTheme.typography.titleMedium.copy(
							fontWeight = FontWeight.Bold,
							letterSpacing = 1.2.sp
						)
					},
					maxLines = 1,
					overflow = TextOverflow.Ellipsis
				)
			}
		}
	}
}