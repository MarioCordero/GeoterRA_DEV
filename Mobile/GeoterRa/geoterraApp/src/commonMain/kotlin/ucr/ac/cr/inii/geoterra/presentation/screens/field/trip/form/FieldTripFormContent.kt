package ucr.ac.cr.inii.geoterra.presentation.screens.field.trip.form

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import ucr.ac.cr.inii.geoterra.presentation.components.common.ActionButton
import ucr.ac.cr.inii.geoterra.presentation.components.common.CustomTextField
import ucr.ac.cr.inii.geoterra.presentation.components.common.DatePickerField
import ucr.ac.cr.inii.geoterra.presentation.components.common.FormSection
import ucr.ac.cr.inii.geoterra.presentation.components.common.SearchableDropdown

@Composable
fun FieldTripFormContent(
	modifier: Modifier,
	state: FieldTripFormState,
	onEvent: (FieldTripFormEvent) -> Unit
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
				value = state.request.field_trip_name,
				onValueChange = { onEvent(FieldTripFormEvent.NameChanged(it)) },
				label = "Nombre de la gira",
				icon = Icons.Default.Title,
				isError = state.fieldErrors["name"] != null,
				errorMessage = state.fieldErrors["name"]
			)

			Row(
				modifier = Modifier
					.fillMaxWidth()
					.padding(vertical = 4.dp),
				verticalAlignment = Alignment.CenterVertically,
				horizontalArrangement = Arrangement.SpaceBetween
			) {
				Column(modifier = Modifier.weight(1f)) {
					Text("Estado de la gira", fontWeight = FontWeight.SemiBold)
					Text(
						text = if (state.request.field_trip_is_active) "Gira Activa" else "Gira Inactiva",
						style = MaterialTheme.typography.bodySmall,
						color = if (state.request.field_trip_is_active) MaterialTheme.colorScheme.primary else Color.Gray
					)
				}
				Switch(
					checked = state.request.field_trip_is_active,
					onCheckedChange = { onEvent(FieldTripFormEvent.ActiveStatusChanged(it)) }
				)
			}
		}

		FormSection(title = "Fechas de la Gira", icon = Icons.Default.DateRange) {
			DatePickerField(
				title = "Seleccione la fecha programada de la gira",
				value = state.request.field_trip_scheduled_date,
				onDateSelected = { onEvent(FieldTripFormEvent.ScheduledDateChanged(it)) },
				label = "Fecha programada",
				icon = Icons.Default.Event,
				isError = state.fieldErrors["scheduled_date"] != null,
				errorMessage = state.fieldErrors["scheduled_date"]
			)

			DatePickerField(
				title = "Seleccione la fecha de inicio de la gira",
				value = state.request.field_trip_start_date ?: "",
				onDateSelected = { onEvent(FieldTripFormEvent.StartDateChanged(it)) },
				label = "Fecha de inicio",
				icon = Icons.Default.PlayArrow
			)

			DatePickerField(
				title = "Seleccione la fecha de finalización de la gira",
				value = state.request.field_trip_finish_date ?: "",
				onDateSelected = { onEvent(FieldTripFormEvent.FinishDateChanged(it)) },
				label = "Fecha de finalización",
				icon = Icons.Default.Flag
			)
		}

		FormSection(title = "Ubicación Geográfica", icon = Icons.Default.LocationOn) {
			SearchableDropdown(
				label = "Provincia",
				items = state.availableProvinces,
				selectedItem = findProvince(state.request.province_snit_code),
				itemToString = { it.province_name },
				onItemSelected = { province ->
					onEvent(FieldTripFormEvent.ProvinceChanged(province?.province_snit_code))
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
					onEvent(FieldTripFormEvent.CantonChanged(canton?.canton_snit_code))
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
					onEvent(FieldTripFormEvent.DistrictChanged(district?.district_snit_code))
				},
				modifier = Modifier.fillMaxWidth(),
				enabled = state.request.canton_snit_code != 0 && filteredDistricts.isNotEmpty(),
				isError = state.fieldErrors["district"] != null,
				errorMessage = state.fieldErrors["district"]
			)
		}

		FormSection(title = "Participantes (Personal)", icon = Icons.Default.Group) {
			SearchableDropdown(
				label = "Agregar investigador o personal",
				items = state.availableUsers.filter { !state.request.participants.contains(it.user_id) },
				selectedItem = null,
				itemToString = { "${it.first_name} ${it.last_name} (${it.email ?: it.role})" },
				onItemSelected = { user ->
					user?.let { onEvent(FieldTripFormEvent.ParticipantAdded(it.user_id)) }
				},
				modifier = Modifier.fillMaxWidth(),
				enabled = state.availableUsers.isNotEmpty()
			)

			if (state.request.participants.isNotEmpty()) {
				Spacer(Modifier.height(8.dp))
				Text("Participantes seleccionados:", style = MaterialTheme.typography.labelMedium, fontWeight = FontWeight.Bold)

				state.request.participants.forEach { participantId ->
					val user = state.availableUsers.find { it.user_id == participantId }
					Row(
						modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
						verticalAlignment = Alignment.CenterVertically,
						horizontalArrangement = Arrangement.SpaceBetween
					) {
						Text(
							text = user?.let { "${it.first_name} ${it.last_name}" } ?: participantId,
							style = MaterialTheme.typography.bodyMedium
						)
						IconButton(onClick = { onEvent(FieldTripFormEvent.ParticipantRemoved(participantId)) }) {
							Icon(Icons.Default.Close, contentDescription = "Remover participante", tint = MaterialTheme.colorScheme.error)
						}
					}
				}
			}
		}

		Spacer(Modifier.height(8.dp))

		ActionButton(
			isLoading = state.isLoading,
			text = if (state.request.field_trip_name.isNotBlank()) "Guardar Cambios" else "Registrar Gira",
			onClick = { onEvent(FieldTripFormEvent.Submit) }
		)

		Spacer(Modifier.height(16.dp))
	}
}