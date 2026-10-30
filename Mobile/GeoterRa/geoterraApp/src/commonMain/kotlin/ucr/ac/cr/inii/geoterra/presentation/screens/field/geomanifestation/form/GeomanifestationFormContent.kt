package ucr.ac.cr.inii.geoterra.presentation.screens.geomanifestation.form

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import ucr.ac.cr.inii.geoterra.presentation.components.common.ActionButton
import ucr.ac.cr.inii.geoterra.presentation.components.common.CustomTextField
import ucr.ac.cr.inii.geoterra.presentation.components.common.FormSection
import ucr.ac.cr.inii.geoterra.presentation.components.common.SearchableDropdown

@Composable
fun GeomanifestationFormContent(
	modifier: Modifier,
	state: GeomanifestationFormState,
	onEvent: (GeomanifestationFormEvent) -> Unit
) {
	fun findProvince(snitCode: Int?) = state.availableProvinces.find { it.province_snit_code == snitCode }
	fun findCanton(snitCode: Int?) = state.availableCantons.find { it.canton_snit_code == snitCode }
	fun findDistrict(snitCode: Int?) = state.availableDistricts.find { it.district_snit_code == snitCode }

	val filteredCantons = state.availableCantons.filter {
		it.canton_snit_code.toString().startsWith(state.request.province_snit_code.toString())
	}
	val filteredDistricts = state.availableDistricts.filter {
		it.district_snit_code.toString().startsWith(state.request.canton_snit_code.toString())
	}

	Column(
		modifier = modifier
			.fillMaxSize()
			.verticalScroll(rememberScrollState()),
		verticalArrangement = Arrangement.spacedBy(12.dp)
	) {
		FormSection(title = "Información General", icon = Icons.Default.Info) {
			CustomTextField(
				value = state.request.geomanifestation_name,
				onValueChange = { onEvent(GeomanifestationFormEvent.NameChanged(it)) },
				label = "Nombre de la manifestación",
				icon = Icons.Default.Title,
				isError = state.fieldErrors["name"] != null,
				errorMessage = state.fieldErrors["name"]
			)

			CustomTextField(
				value = state.request.description,
				onValueChange = { onEvent(GeomanifestationFormEvent.DescriptionChanged(it)) },
				label = "Descripción",
				icon = Icons.Default.Description,
				isError = state.fieldErrors["description"] != null,
				errorMessage = state.fieldErrors["description"]
			)

			Row(
				modifier = Modifier
					.fillMaxWidth()
					.padding(vertical = 4.dp),
				verticalAlignment = Alignment.CenterVertically,
				horizontalArrangement = Arrangement.SpaceBetween
			) {
				Column(modifier = Modifier.weight(1f)) {
					Text("Visibilidad Pública", fontWeight = FontWeight.SemiBold)
					Text(
						text = if (state.request.visibility) "Visible públicamente" else "Oculto / Privado",
						style = MaterialTheme.typography.bodySmall,
						color = if (state.request.visibility) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.outline
					)
				}
				Switch(
					checked = state.request.visibility,
					onCheckedChange = { onEvent(GeomanifestationFormEvent.VisibilityChanged(it)) }
				)
			}
		}

		FormSection(title = "Ubicación Geográfica", icon = Icons.Default.LocationOn) {
			SearchableDropdown(
				label = "Provincia",
				items = state.availableProvinces,
				selectedItem = findProvince(state.request.province_snit_code),
				itemToString = { it.province_name },
				onItemSelected = { province ->
					onEvent(GeomanifestationFormEvent.ProvinceChanged(province?.province_snit_code))
				},
				modifier = Modifier.fillMaxWidth(),
				enabled = state.availableProvinces.isNotEmpty(),
				isError = state.fieldErrors["province"] != null,
				errorMessage = state.fieldErrors["province"]
			)

			SearchableDropdown(
				label = "Cantón",
				items = filteredCantons,
				selectedItem = findCanton(state.request.canton_snit_code),
				itemToString = { it.canton_name },
				onItemSelected = { canton ->
					onEvent(GeomanifestationFormEvent.CantonChanged(canton?.canton_snit_code))
				},
				modifier = Modifier.fillMaxWidth(),
				enabled = state.request.province_snit_code != 0 && filteredCantons.isNotEmpty(),
				isError = state.fieldErrors["canton"] != null,
				errorMessage = state.fieldErrors["canton"]
			)

			SearchableDropdown(
				label = "Distrito",
				items = filteredDistricts,
				selectedItem = findDistrict(state.request.district_snit_code),
				itemToString = { it.district_name },
				onItemSelected = { district ->
					onEvent(GeomanifestationFormEvent.DistrictChanged(district?.district_snit_code))
				},
				modifier = Modifier.fillMaxWidth(),
				enabled = state.request.canton_snit_code != 0 && filteredDistricts.isNotEmpty(),
				isError = state.fieldErrors["district"] != null,
				errorMessage = state.fieldErrors["district"]
			)

			Row(
				modifier = Modifier.fillMaxWidth(),
				horizontalArrangement = Arrangement.spacedBy(8.dp)
			) {
				CustomTextField(
					value = if (state.request.latitude == 0.0) "" else state.request.latitude.toString(),
					onValueChange = { onEvent(GeomanifestationFormEvent.LatitudeChanged(it)) },
					label = "Latitud",
					icon = Icons.Default.MyLocation,
					modifier = Modifier.weight(1f)
				)
				CustomTextField(
					value = if (state.request.longitude == 0.0) "" else state.request.longitude.toString(),
					onValueChange = { onEvent(GeomanifestationFormEvent.LongitudeChanged(it)) },
					label = "Longitud",
					icon = Icons.Default.MyLocation,
					modifier = Modifier.weight(1f)
				)
			}
		}

		FormSection(title = "Asociación de Gira", icon = Icons.Default.Event) {
			OutlinedTextField(
				value = state.request.field_trip_id ?: "Asociado a gira actual",
				onValueChange = {},
				enabled = false,
				label = { Text("ID de Gira de Campo (Bloqueado)") },
				modifier = Modifier.fillMaxWidth()
			)
		}

		Spacer(Modifier.height(8.dp))

		ActionButton(
			isLoading = state.isLoading,
			text = "Guardar Manifestación",
			onClick = { onEvent(GeomanifestationFormEvent.Submit) }
		)

		Spacer(Modifier.height(16.dp))
	}
}