package ucr.ac.cr.inii.geoterra.presentation.components.common

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.expandVertically
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.shrinkVertically
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.relocation.BringIntoViewRequester
import androidx.compose.foundation.relocation.bringIntoViewRequester
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowDropDown
import androidx.compose.material.icons.filled.ArrowDropUp
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.focus.onFocusChanged
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.delay

@Composable
fun <T> SearchableDropdown(
	label: String,
	items: List<T>,
	selectedItem: T?,
	itemToString: (T) -> String,
	onItemSelected: (T?) -> Unit,
	modifier: Modifier = Modifier,
	enabled: Boolean = true
) {
	var expanded by remember { mutableStateOf(false) }
	var searchQuery by remember { mutableStateOf("") }

	val focusManager = LocalFocusManager.current
	val focusRequester = remember { FocusRequester() }
	val bringIntoViewRequester = remember { BringIntoViewRequester() }

	val filteredItems = remember(items, searchQuery) {
		items.filter { itemToString(it).contains(searchQuery, ignoreCase = true) }
	}

	val textFieldValue = if (expanded) searchQuery else (selectedItem?.let { itemToString(it) } ?: "")

	Column(modifier = modifier.fillMaxWidth()) {
		OutlinedTextField(
			value = textFieldValue,
			onValueChange = { newValue ->
				searchQuery = newValue
				expanded = true
			},
			enabled = enabled,
			label = { Text(label) },
			placeholder = {
				Text(
					text = selectedItem?.let { itemToString(it) } ?: "Buscar...",
					color = MaterialTheme.colorScheme.outline
				)
			},
			singleLine = true,
			trailingIcon = {
				Row(verticalAlignment = Alignment.CenterVertically) {
					IconButton(
						onClick = {
							if (enabled) {
								if (expanded) {
									focusManager.clearFocus()
								} else {
									focusRequester.requestFocus()
								}
							}
						},
						enabled = enabled
					) {
						Icon(
							imageVector = if (expanded) Icons.Default.ArrowDropUp else Icons.Default.ArrowDropDown,
							contentDescription = if (expanded) "Cerrar menú" else "Abrir menú",
							tint = MaterialTheme.colorScheme.onSurface
						)
					}
				}
			},
			modifier = Modifier
				.fillMaxWidth()
				.focusRequester(focusRequester)
				.onFocusChanged { focusState ->
					expanded = focusState.isFocused
					if (focusState.isFocused) {
						searchQuery = ""
					}
				},
			shape = RoundedCornerShape(12.dp),
			colors = OutlinedTextFieldDefaults.colors(
				unfocusedLabelColor = MaterialTheme.colorScheme.outline,
				focusedLabelColor = MaterialTheme.colorScheme.primary,
				focusedBorderColor = MaterialTheme.colorScheme.primary,
				unfocusedBorderColor = MaterialTheme.colorScheme.outline,
				focusedContainerColor = MaterialTheme.colorScheme.surface,
				unfocusedContainerColor = MaterialTheme.colorScheme.surface,
				disabledContainerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f)
			)
		)

		AnimatedVisibility(
			visible = expanded && enabled,
			enter = fadeIn() + expandVertically(),
			exit = fadeOut() + shrinkVertically()
		) {
			LaunchedEffect(expanded) {
				if (expanded) {
					delay(200)
					bringIntoViewRequester.bringIntoView()
				}
			}

			Card(
				modifier = Modifier
					.fillMaxWidth()
					.padding(top = 4.dp)
					.bringIntoViewRequester(bringIntoViewRequester),
				shape = RoundedCornerShape(12.dp),
				colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
				elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
			) {
				Box(
					modifier = Modifier
						.heightIn(max = 200.dp)
						.padding(vertical = 4.dp)
				) {
					Column(modifier = Modifier.verticalScroll(rememberScrollState())) {
						if (filteredItems.isEmpty()) {
							Text(
								text = "No se encontraron resultados",
								style = MaterialTheme.typography.bodyMedium,
								modifier = Modifier
									.fillMaxWidth()
									.padding(vertical = 12.dp, horizontal = 16.dp),
								color = MaterialTheme.colorScheme.onSurface
							)
						} else {
							filteredItems.forEach { item ->
								DropdownMenuItem(
									text = { Text(itemToString(item)) },
									onClick = {
										onItemSelected(item)
										focusManager.clearFocus()
									},
									contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp)
								)
							}
						}
					}
				}
			}
		}
	}
}