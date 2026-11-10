package ucr.ac.cr.inii.geoterra.presentation.components.common

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.wrapContentHeight
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun FormSection(
	title: String? = null,
	icon: ImageVector? = null,
	content: @Composable ColumnScope.() -> Unit
) {
	Column(
		modifier = Modifier
			.wrapContentHeight()
			.fillMaxWidth(),
	) {
		if (title != null || icon != null) {
			SectionHeader(
				title = title ?: "",
				icon = icon,
				modifier = Modifier.padding(bottom = 4.dp)
			)
		}
		Column(
			modifier = Modifier
				.fillMaxWidth()
				.padding(if (title == null && icon == null) 0.dp else 8.dp),
			verticalArrangement = Arrangement.spacedBy(8.dp)
		) {
			content()
		}
	}
}