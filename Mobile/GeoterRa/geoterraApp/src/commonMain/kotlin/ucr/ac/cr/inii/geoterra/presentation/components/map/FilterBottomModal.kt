package ucr.ac.cr.inii.geoterra.presentation.components.map

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.animateDpAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Layers
import androidx.compose.material.icons.filled.Map
import androidx.compose.material.icons.filled.Thermostat
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.launch
import ucr.ac.cr.inii.geoterra.presentation.components.common.ActionButton
import ucr.ac.cr.inii.geoterra.presentation.components.common.OutlinedActionButton
import ucr.ac.cr.inii.geoterra.presentation.components.common.SearchableDropdown
import ucr.ac.cr.inii.geoterra.presentation.components.common.SectionHeader
import ucr.ac.cr.inii.geoterra.presentation.screens.map.MapLayer
import ucr.ac.cr.inii.geoterra.presentation.screens.map.MapState

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FilterBottomModal(
	isVisible: Boolean,
	state: MapState,
	onProvinceSelected: (Int?) -> Unit,
	onCantonSelected: (Int?) -> Unit,
	onDistrictSelected: (Int?) -> Unit,
	onTempMinChange: (Double?) -> Unit,
	onTempMaxChange: (Double?) -> Unit,
	toggleLayer: (String) -> Unit,
	onDismiss: () -> Unit,
	onApplyFilters: () -> Unit,
	onClearFilters: () -> Unit,
	sheetState: SheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
) {
	val scope = rememberCoroutineScope()
	val scrollState = rememberScrollState()

	// Local text states hooked to the state
	var minTempText by remember(state.selectedTempMin) {
		mutableStateOf(state.selectedTempMin?.toString() ?: "")
	}
	var maxTempText by remember(state.selectedTempMax) {
		mutableStateOf(state.selectedTempMax?.toString() ?: "")
	}

	val numericRegex = remember { Regex("""^-?\d*\.?\d*$""") }

	// Helpers to resolve geographical models from selected SNIT identifiers
	fun findProvince(snitCode: Int?) =
		state.availableProvinces.find { it.province_snit_code == snitCode }

	fun findCanton(snitCode: Int?) = state.availableCantons.find { it.canton_snit_code == snitCode }
	fun findDistrict(snitCode: Int?) =
		state.availableDistricts.find { it.district_snit_code == snitCode }

	// Hierarchical cascading filtering logic for downstream entities
	val filteredCantons = state.availableCantons.filter {
		it.canton_snit_code.toString().startsWith(state.selectedProvinceSnitCode.toString())
	}
	val filteredDistricts = state.availableDistricts.filter {
		it.district_snit_code.toString().startsWith(state.selectedCantonSnitCode.toString())
	}

	if (isVisible) {
		ModalBottomSheet(
			onDismissRequest = {
				scope.launch { sheetState.hide() }.invokeOnCompletion { onDismiss() }
			},
			sheetState = sheetState,
			containerColor = MaterialTheme.colorScheme.surface,
			shape = RoundedCornerShape(topStart = 32.dp, topEnd = 32.dp),
			dragHandle = { BottomSheetDefaults.DragHandle(width = 40.dp) }
		) {
			Column(
				modifier = Modifier
					.fillMaxWidth()
					.verticalScroll(scrollState)
					.padding(horizontal = 24.dp)
					.padding(bottom = 32.dp)
			) {
				// --- Header ---
				Row(
					modifier = Modifier.fillMaxWidth(),
					horizontalArrangement = Arrangement.SpaceBetween,
					verticalAlignment = Alignment.CenterVertically
				) {
					Text(
						text = "Configuración de Mapa",
						style = MaterialTheme.typography.headlineSmall.copy(
							fontWeight = FontWeight.ExtraBold,
							letterSpacing = (-0.5).sp
						)
					)
				}

				Spacer(modifier = Modifier.height(24.dp))

				// --- Layer selection ---
				SectionHeader(title = "Capas", icon = Icons.Default.Map)
				Spacer(modifier = Modifier.height(12.dp))

				Row(
					modifier = Modifier.fillMaxWidth(),
					horizontalArrangement = Arrangement.spacedBy(12.dp),
					verticalAlignment = Alignment.CenterVertically
				) {
					state.availableStyleLayers.forEach { layer ->
						TileCard(
							layer = layer,
							isSelected = state.selectedLayerIds.contains(layer.id),
							onSelect = { toggleLayer(layer.id) },
							modifier = Modifier.weight(1f)
						)
					}
				}

				Spacer(modifier = Modifier.height(32.dp))

				// --- Geographical filters ---
				SectionHeader(title = "Filtros Geográficos", icon = Icons.Default.Map)
				Spacer(modifier = Modifier.height(16.dp))

				// Province dropdown
				SearchableDropdown(
					label = "Provincia",
					items = state.availableProvinces,
					selectedItem = findProvince(state.selectedProvinceSnitCode),
					itemToString = { it.province_name },
					onItemSelected = { province ->
						onProvinceSelected(province?.province_snit_code)
					},
					modifier = Modifier.fillMaxWidth(),
					enabled = state.availableProvinces.isNotEmpty()
				)

				Spacer(modifier = Modifier.height(12.dp))

				// Canton dropdown – enabled only when a province is selected
				SearchableDropdown(
					label = "Cantón",
					items = filteredCantons,
					selectedItem = findCanton(state.selectedCantonSnitCode),
					itemToString = { it.canton_name },
					onItemSelected = { canton ->
						onCantonSelected(canton?.canton_snit_code)
					},
					modifier = Modifier.fillMaxWidth(),
					enabled = state.selectedProvinceSnitCode != null && filteredCantons.isNotEmpty()
				)

				Spacer(modifier = Modifier.height(12.dp))

				// District dropdown – enabled only when a canton is selected
				SearchableDropdown(
					label = "Distrito",
					items = filteredDistricts,
					selectedItem = findDistrict(state.selectedDistrictSnitCode),
					itemToString = { it.district_name },
					onItemSelected = { district ->
						onDistrictSelected(district?.district_snit_code)
					},
					modifier = Modifier.fillMaxWidth(),
					enabled = state.selectedCantonSnitCode != null && filteredDistricts.isNotEmpty()
				)

				Spacer(modifier = Modifier.height(12.dp))

				// District dropdown – enabled only when a canton is selected
				SearchableDropdown(
					label = "Distrito",
					items = filteredDistricts,
					selectedItem = findDistrict(state.selectedDistrictSnitCode),
					itemToString = { it.district_name },
					onItemSelected = { district ->
						onDistrictSelected(district?.district_snit_code)
					},
					modifier = Modifier.fillMaxWidth(),
					enabled = state.selectedCantonSnitCode != null && filteredDistricts.isNotEmpty()
				)

				Spacer(modifier = Modifier.height(32.dp))

				// --- Temperature filters ---
				SectionHeader(title = "Rango de Temperatura (°C)", icon = Icons.Default.Thermostat)
				Spacer(modifier = Modifier.height(16.dp))

				Row(
					modifier = Modifier.fillMaxWidth(),
					horizontalArrangement = Arrangement.spacedBy(16.dp),
					verticalAlignment = Alignment.CenterVertically
				) {
					OutlinedTextField(
						value = minTempText,
						onValueChange = { input ->
							if (input.isEmpty() || input.matches(numericRegex)) {
								minTempText = input
								onTempMinChange(input.toDoubleOrNull())
							}
						},
						label = { Text("Mínima") },
						placeholder = {
							Text(
								text = "Ej: 25.0",
								color = MaterialTheme.colorScheme.outline
							)
						},
						singleLine = true,
						keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
						shape = RoundedCornerShape(12.dp),
						colors = OutlinedTextFieldDefaults.colors(
							unfocusedLabelColor = MaterialTheme.colorScheme.outline,
							focusedLabelColor = MaterialTheme.colorScheme.primary,
							focusedBorderColor = MaterialTheme.colorScheme.primary,
							unfocusedBorderColor = MaterialTheme.colorScheme.outline,
							focusedContainerColor = MaterialTheme.colorScheme.surface,
							unfocusedContainerColor = MaterialTheme.colorScheme.surface,
							disabledContainerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f)
						),
						modifier = Modifier.weight(1f)
					)

					OutlinedTextField(
						value = maxTempText,
						onValueChange = { input ->
							if (input.isEmpty() || input.matches(numericRegex)) {
								maxTempText = input
								onTempMaxChange(input.toDoubleOrNull())
							}
						},
						label = { Text("Máxima") },
						placeholder = { Text("Ej: 85.5") },
						singleLine = true,
						keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
						shape = RoundedCornerShape(12.dp),
						colors = OutlinedTextFieldDefaults.colors(
							unfocusedLabelColor = MaterialTheme.colorScheme.outline,
							focusedLabelColor = MaterialTheme.colorScheme.primary,
							focusedBorderColor = MaterialTheme.colorScheme.primary,
							unfocusedBorderColor = MaterialTheme.colorScheme.outline,
							focusedContainerColor = MaterialTheme.colorScheme.surface,
							unfocusedContainerColor = MaterialTheme.colorScheme.surface,
							disabledContainerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f)
						),
						modifier = Modifier.weight(1f)
					)
				}

				Spacer(modifier = Modifier.height(32.dp))

				// --- Action Buttons Layout ---
				Row(
					modifier = Modifier.fillMaxWidth(),
					horizontalArrangement = Arrangement.spacedBy(12.dp),
					verticalAlignment = Alignment.CenterVertically
				) {
					OutlinedActionButton(
						text = "Limpiar",
						onClick = onClearFilters,
						modifier = Modifier.weight(1f)
					)

					ActionButton(
						onClick = {
							scope.launch { sheetState.hide() }.invokeOnCompletion { onApplyFilters() }
						},
						text = "Aplicar",
						isLoading = false,
						modifier = Modifier.weight(1f)
					)
				}
			}
		}
	}
}

/**
 * A downscaled map style layer indicator card optimized for balanced horizontal distribution.
 */
@Composable
fun TileCard(
	layer: MapLayer,
	isSelected: Boolean,
	onSelect: () -> Unit,
	modifier: Modifier = Modifier
) {
	val borderWidth by animateDpAsState(if (isSelected) 2.dp else 1.dp, label = "borderWidth")
	val borderColor by animateColorAsState(
		if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.outline,
		label = "borderColor"
	)

	Column(
		horizontalAlignment = Alignment.CenterHorizontally,
		modifier = modifier
			.clip(RoundedCornerShape(16.dp))
			.clickable { onSelect() }
	) {
		Box(
			modifier = Modifier
				.size(76.dp)
				.background(
					if (isSelected) MaterialTheme.colorScheme.primaryContainer
					else MaterialTheme.colorScheme.surfaceVariant,
					RoundedCornerShape(16.dp)
				)
				.border(borderWidth, borderColor, RoundedCornerShape(16.dp)),
			contentAlignment = Alignment.Center
		) {
			Icon(
				imageVector = Icons.Default.Layers,
				contentDescription = null,
				modifier = Modifier.size(26.dp),
				tint = if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.outline
			)

			if (isSelected) {
				Icon(
					Icons.Default.CheckCircle,
					contentDescription = null,
					modifier = Modifier
						.align(Alignment.TopEnd)
						.padding(6.dp)
						.size(16.dp),
					tint = MaterialTheme.colorScheme.primary
				)
			}
		}
		Spacer(modifier = Modifier.height(6.dp))
		Text(
			text = layer.name,
			style = MaterialTheme.typography.bodySmall.copy(
				fontWeight = if (isSelected) FontWeight.ExtraBold else FontWeight.Medium,
				textAlign = TextAlign.Center,
				fontSize = 11.sp
			),
			color = if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurface
		)
	}
}