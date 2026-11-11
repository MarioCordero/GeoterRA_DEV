
package ucr.ac.cr.inii.geoterra.presentation.components.common

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import cafe.adriel.voyager.navigator.tab.Tab
import cafe.adriel.voyager.navigator.tab.TabNavigator

@Composable
fun BottomNavBar(
	items: List<Tab>,
	tabNavigator: TabNavigator
) {
	BoxWithConstraints(
		modifier = Modifier.fillMaxWidth()
	) {
		// Available width of the navigation component.
		val availableWidth = maxWidth

		// Determine the navigation bar dimensions progressively.
		val iconSize = (availableWidth * 0.075f)
			.coerceIn(25.dp, 32.dp)

		val barHeight = (iconSize * 2.65f)
			.coerceIn(68.dp, 88.dp)

		val horizontalPadding = when {
			availableWidth >= 600.dp -> 24.dp
			availableWidth < 360.dp -> 10.dp
			else -> 16.dp
		}

		val verticalPadding = 8.dp

		val iconTextSpacing = (iconSize * 0.12f)
			.coerceIn(3.dp, 5.dp)

		val itemCornerRadius = 16.dp

		// Adapt typography to the available screen width.
		val labelStyle = when {
			availableWidth >= 600.dp ->
				MaterialTheme.typography.labelMedium

			availableWidth < 360.dp ->
				MaterialTheme.typography.labelSmall

			else ->
				MaterialTheme.typography.labelMedium
		}

		Surface(
			modifier = Modifier
				.fillMaxWidth()
				.navigationBarsPadding()
				.padding(
					horizontal = horizontalPadding,
					vertical = verticalPadding
				)
				.height(barHeight),
			shape = RoundedCornerShape(barHeight / 2),
			color = MaterialTheme.colorScheme.surface,
			shadowElevation = 8.dp
		) {
			Row(
				modifier = Modifier
					.fillMaxWidth()
					.padding(horizontal = 8.dp),
				horizontalArrangement = Arrangement.SpaceEvenly,
				verticalAlignment = Alignment.CenterVertically
			) {
				items.forEach { tab ->
					val isSelected =
						tabNavigator.current.key == tab.key

					Column(
						horizontalAlignment = Alignment.CenterHorizontally,
						verticalArrangement = Arrangement.Center,
						modifier = Modifier
							.weight(1f)
							.clip(RoundedCornerShape(itemCornerRadius))
							.clickable {
								tabNavigator.current = tab
							}
							.padding(
								vertical = 4.dp,
								horizontal = 2.dp
							)
					) {
						Icon(
							painter = tab.options.icon!!,
							contentDescription = tab.options.title,
							modifier = Modifier.size(iconSize),
							tint = if (isSelected) {
								MaterialTheme.colorScheme.onSurface
							} else {
								MaterialTheme.colorScheme.outline
							}
						)

						Spacer(
							modifier = Modifier.height(iconTextSpacing)
						)

						Text(
							text = tab.options.title,
							style = labelStyle,
							color = if (isSelected) {
								MaterialTheme.colorScheme.onSurface
							} else {
								MaterialTheme.colorScheme.outline
							},
							maxLines = 1,
							overflow = TextOverflow.Ellipsis
						)
					}
				}
			}
		}
	}
}
