package ucr.ac.cr.inii.geoterra.presentation.screens.field.insitu.form

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import ucr.ac.cr.inii.geoterra.presentation.components.common.ActionButton
import ucr.ac.cr.inii.geoterra.presentation.components.common.CustomTextField
import ucr.ac.cr.inii.geoterra.presentation.components.common.FormSection

@Composable
fun InSituFormContent(
	modifier: Modifier,
	state: InSituFormState,
	onEvent: (InSituFormEvent) -> Unit
) {
	Column(
		modifier = modifier
			.fillMaxSize()
			.verticalScroll(rememberScrollState()),
		verticalArrangement = Arrangement.spacedBy(12.dp)
	) {
		FormSection(title = "Información General", icon = Icons.Default.Info) {
			CustomTextField(
				value = state.request.insitu_test_name ?: "",
				onValueChange = { onEvent(InSituFormEvent.NameChanged(it)) },
				label = "Nombre de la prueba",
				icon = Icons.Default.Title,
				isError = state.fieldErrors["name"] != null,
				errorMessage = state.fieldErrors["name"]
			)

			CustomTextField(
				value = state.request.description ?: "",
				onValueChange = { onEvent(InSituFormEvent.DescriptionChanged(it)) },
				label = "Descripción y Notas",
				icon = Icons.Default.Description,
				isError = state.fieldErrors["description"] != null,
				errorMessage = state.fieldErrors["description"]
			)
		}

		FormSection(title = "Mediciones Fisicoquímicas", icon = Icons.Default.Science) {
			CustomTextField(
				value = state.temperatureInput,
				onValueChange = { onEvent(InSituFormEvent.TemperatureChanged(it)) },
				label = "Temperatura (°C)",
				icon = Icons.Default.DeviceThermostat,
				keyboardType = KeyboardType.Decimal,
				isError = state.fieldErrors["temperature"] != null,
				errorMessage = state.fieldErrors["temperature"]
			)

			CustomTextField(
				value = state.phInput,
				onValueChange = { onEvent(InSituFormEvent.PhChanged(it)) },
				label = "pH",
				icon = Icons.Default.Science,
				keyboardType = KeyboardType.Decimal,
				isError = state.fieldErrors["ph"] != null,
				errorMessage = state.fieldErrors["ph"]
			)

			CustomTextField(
				value = state.conductivityInput,
				onValueChange = { onEvent(InSituFormEvent.ConductivityChanged(it)) },
				label = "Conductividad (µS/cm)",
				icon = Icons.Default.WaterDrop,
				keyboardType = KeyboardType.Decimal,
				isError = state.fieldErrors["conductivity"] != null,
				errorMessage = state.fieldErrors["conductivity"]
			)
		}

		FormSection(title = "Asociación de Geomanifestación", icon = Icons.Default.Place) {
			OutlinedTextField(
				value = state.geomanifestationName.ifBlank { "Asociado a la manifestación actual" },
				onValueChange = {},
				enabled = false,
				label = { Text("Geomanifestación (Bloqueado)") },
				modifier = Modifier.fillMaxWidth()
			)
		}

		Spacer(Modifier.height(8.dp))

		ActionButton(
			isLoading = state.isLoading,
			text = "Guardar Prueba de Campo",
			onClick = { onEvent(InSituFormEvent.Submit) }
		)

		Spacer(Modifier.height(16.dp))
	}
}