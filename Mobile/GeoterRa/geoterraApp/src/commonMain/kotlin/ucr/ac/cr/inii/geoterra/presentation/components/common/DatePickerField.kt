package ucr.ac.cr.inii.geoterra.presentation.components.common
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CalendarToday
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import kotlinx.datetime.Instant
import kotlinx.datetime.TimeZone
import kotlinx.datetime.toLocalDateTime
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DatePickerField(
	title: String = "Selecciona una fecha",
	value: String?,
	onDateSelected: (String) -> Unit,
	label: String,
	modifier: Modifier = Modifier,
	icon: ImageVector = Icons.Default.CalendarToday,
	isError: Boolean = false,
	errorMessage: String? = null,
	enabled: Boolean = true,
	allowClear: Boolean = false
) {
	var showDatePicker by remember { mutableStateOf(false) }
	Box(modifier = modifier.fillMaxWidth()) {
		OutlinedTextField(
			value = value ?: "",
			onValueChange = {},
			readOnly = true,
			enabled = enabled,
			label = { Text(label) },
			leadingIcon = { Icon(icon, contentDescription = null) },
			trailingIcon = {
				if (allowClear && !value.isNullOrBlank() && enabled) {
					IconButton(onClick = { onDateSelected("") }) {
						Icon(Icons.Default.Clear, contentDescription = "Limpiar fecha")
					}
				}
			},
			isError = isError,
			supportingText = if (isError && errorMessage != null) {
				{ Text(errorMessage) }
			} else null,
			modifier = Modifier
				.fillMaxWidth()
				.clickable(enabled = enabled) { showDatePicker = true },
			shape = RoundedCornerShape(12.dp),
			colors = OutlinedTextFieldDefaults.colors(
				unfocusedLabelColor = MaterialTheme.colorScheme.outline,
				focusedLabelColor = MaterialTheme.colorScheme.primary,
				unfocusedLeadingIconColor = MaterialTheme.colorScheme.outline,
				focusedLeadingIconColor = MaterialTheme.colorScheme.primary,
				focusedBorderColor = MaterialTheme.colorScheme.primary,
				unfocusedBorderColor = MaterialTheme.colorScheme.outline,
				unfocusedTextColor = MaterialTheme.colorScheme.outline,
				errorBorderColor = MaterialTheme.colorScheme.error
			)
		)
		Box(
			modifier = Modifier
				.matchParentSize()
				.clickable(enabled = enabled) { showDatePicker = true }
		)
	}
	if (showDatePicker) {
		val datePickerState = rememberDatePickerState()
		DatePickerDialog(
			onDismissRequest = { showDatePicker = false },
			colors = DatePickerDefaults.colors(
				containerColor = MaterialTheme.colorScheme.surface,
				titleContentColor = MaterialTheme.colorScheme.onSurfaceVariant,
				headlineContentColor = MaterialTheme.colorScheme.onSurface,
				subheadContentColor = MaterialTheme.colorScheme.onSurface,
				navigationContentColor = MaterialTheme.colorScheme.onSurfaceVariant,
				weekdayContentColor = MaterialTheme.colorScheme.onSurfaceVariant,
				yearContentColor = MaterialTheme.colorScheme.onSurface,
				disabledYearContentColor = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.38f),
				currentYearContentColor = MaterialTheme.colorScheme.primary,
				selectedYearContentColor = MaterialTheme.colorScheme.onPrimary,
				disabledSelectedYearContentColor = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.38f),
				selectedYearContainerColor = MaterialTheme.colorScheme.primary,
				disabledSelectedYearContainerColor = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.12f),
				dayContentColor = MaterialTheme.colorScheme.onSurface,
				disabledDayContentColor = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.38f),
				selectedDayContentColor = MaterialTheme.colorScheme.onPrimary,
				disabledSelectedDayContentColor = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.38f),
				selectedDayContainerColor = MaterialTheme.colorScheme.primary,
				disabledSelectedDayContainerColor = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.12f),
				todayContentColor = MaterialTheme.colorScheme.primary,
				todayDateBorderColor = MaterialTheme.colorScheme.primary,
				dayInSelectionRangeContentColor = MaterialTheme.colorScheme.onPrimaryContainer,
				dayInSelectionRangeContainerColor = MaterialTheme.colorScheme.primaryContainer,
				dividerColor = MaterialTheme.colorScheme.outlineVariant,
				dateTextFieldColors = TextFieldDefaults.colors(
					focusedTextColor = MaterialTheme.colorScheme.onSurface,
					unfocusedTextColor = MaterialTheme.colorScheme.onSurface,
					disabledTextColor = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.38f),
					focusedLabelColor = MaterialTheme.colorScheme.primary,
					unfocusedLabelColor = MaterialTheme.colorScheme.outline,
					focusedIndicatorColor = MaterialTheme.colorScheme.primary,
					unfocusedIndicatorColor = MaterialTheme.colorScheme.outline,
					focusedContainerColor = MaterialTheme.colorScheme.surface,
					unfocusedContainerColor = MaterialTheme.colorScheme.surface,
					disabledContainerColor = MaterialTheme.colorScheme.surface
				)
			),
			confirmButton = {
				TextButton(
					onClick = {
						datePickerState.selectedDateMillis?.let { millis ->
							val instant = Instant.fromEpochMilliseconds(millis)
							val localDate = instant.toLocalDateTime(TimeZone.UTC).date
							onDateSelected(localDate.toString())
						}
						showDatePicker = false
					}
				) {
					Text("Aceptar", color = MaterialTheme.colorScheme.onSurface)
				}
			},
			dismissButton = {
				TextButton(onClick = { showDatePicker = false }) {
					Text("Cancelar", color = MaterialTheme.colorScheme.onSurface)
				}
			}
		) {
			DatePicker(
				title = {
					Text(
						text = title,
						modifier = Modifier.padding(
							start = 24.dp,
							end = 24.dp,
							top = 16.dp
						),
						style = MaterialTheme.typography.labelLarge,
						color = MaterialTheme.colorScheme.onSurface
					)
				},

				headline = {
					Text(
						text = datePickerState.selectedDateMillis?.let { millis ->
							Instant
								.fromEpochMilliseconds(millis)
								.toLocalDateTime(TimeZone.UTC)
								.date
								.toString()
						} ?: "Seleccione un día",
						modifier = Modifier.padding(
							start = 24.dp,
							end = 24.dp,
							bottom = 8.dp
						),
						style = MaterialTheme.typography.headlineMedium,
						color = MaterialTheme.colorScheme.onSurface
					)
				},
				state = datePickerState,
				colors = DatePickerDefaults.colors(
					containerColor = MaterialTheme.colorScheme.surface,

					titleContentColor = MaterialTheme.colorScheme.onSurface,
					headlineContentColor = MaterialTheme.colorScheme.onSurface,

					subheadContentColor = MaterialTheme.colorScheme.onSurface,
					weekdayContentColor = MaterialTheme.colorScheme.onSurface,
					navigationContentColor = MaterialTheme.colorScheme.onSurface,
					dayContentColor = MaterialTheme.colorScheme.onSurface,
					disabledDayContentColor = MaterialTheme.colorScheme.onSurfaceVariant,
					selectedDayContentColor = MaterialTheme.colorScheme.onSurface,
					selectedDayContainerColor = MaterialTheme.colorScheme.primary,
					todayContentColor = MaterialTheme.colorScheme.primary,
					todayDateBorderColor = MaterialTheme.colorScheme.primary,
					yearContentColor = MaterialTheme.colorScheme.onSurface,
					currentYearContentColor = MaterialTheme.colorScheme.primary,
					selectedYearContentColor = MaterialTheme.colorScheme.onSurface,
					selectedYearContainerColor = MaterialTheme.colorScheme.primary,
					dividerColor = MaterialTheme.colorScheme.onSurfaceVariant
				)
			)
		}
	}
}