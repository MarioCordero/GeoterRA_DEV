package ucr.ac.cr.inii.geoterra.presentation.components.common

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
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
import androidx.compose.ui.unit.dp
import cafe.adriel.voyager.navigator.tab.Tab
import cafe.adriel.voyager.navigator.tab.TabNavigator

@Composable
fun BottomNavBar(
	items: List<Tab>,
	tabNavigator: TabNavigator
) {
	Surface(
		modifier = Modifier
			.fillMaxWidth()
			.navigationBarsPadding()
			.padding(horizontal = 16.dp, vertical = 8.dp)
			.height(64.dp),
		shape = RoundedCornerShape(32.dp),
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
				val isSelected = tabNavigator.current.key == tab.key

				Column(
					horizontalAlignment = Alignment.CenterHorizontally,
					verticalArrangement = Arrangement.Center,
					modifier = Modifier
						.weight(1f)
						.clip(RoundedCornerShape(12.dp))
						.clickable { tabNavigator.current = tab }
						.padding(vertical = 4.dp)
				) {
					Icon(
						painter = tab.options.icon!!,
						contentDescription = tab.options.title,
						modifier = Modifier.size(24.dp),
						tint = if (isSelected) MaterialTheme.colorScheme.onSurface else MaterialTheme.colorScheme.outline
					)
					Spacer(modifier = Modifier.height(2.dp))
					Text(
						text = tab.options.title,
						style = MaterialTheme.typography.labelSmall,
						color = if (isSelected) MaterialTheme.colorScheme.onSurface else MaterialTheme.colorScheme.outline,
						maxLines = 1,
						overflow = TextOverflow.Ellipsis
					)
				}
			}
		}
	}
}