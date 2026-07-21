package ucr.ac.cr.inii.geoterra.presentation.screens.investigation.requests.form

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import ucr.ac.cr.inii.geoterra.presentation.components.common.CustomTextField
import ucr.ac.cr.inii.geoterra.presentation.components.common.FormSection
import ucr.ac.cr.inii.geoterra.presentation.components.common.SearchableDropdown

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun InvestigationRequestFormContent(
  modifier: Modifier,
  state: InvestigationRequestFormState,
  onEvent: (AnalysisFormEvent) -> Unit,
) {
  // Helper to resolve models from SNIT codes
  fun findProvince(snitCode: Int?) = state.availableProvinces.find { it.province_snit_code == snitCode }
  fun findCanton(snitCode: Int?) = state.availableCantons.find { it.canton_snit_code == snitCode }
  fun findDistrict(snitCode: Int?) = state.availableDistricts.find { it.district_snit_code == snitCode }

  // Filtered lists for cascading
  val filteredCantons = state.availableCantons.filter {
    it.canton_snit_code.toString().startsWith(state.request.province_snit_code.toString())
  }
  val filteredDistricts = state.availableDistricts.filter {
    it.district_snit_code.toString().startsWith(state.request.canton_snit_code.toString())
  }

  // Static options for dropdowns
  val usageOptions = listOf("Residencial", "Comercial", "Turístico", "Conservación", "Ganadería", "Otro")
  val tempOptions = listOf("Hirviendo", "Muy Caliente", "Caliente", "Templado", "Natural", "Sin Especificar")
  val relationOptions = listOf("Familiar", "Empleado", "Socio", "Conocido", "Titular")

  Column(
    modifier = modifier
      .fillMaxSize()
      .padding(horizontal = 16.dp)
      .verticalScroll(rememberScrollState()),
    verticalArrangement = Arrangement.spacedBy(12.dp)
  ) {

    FormSection(title = "Ubicación Geográfica", icon = Icons.Default.Explore) {
      Column(
        modifier = Modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(8.dp)
      ) {
        // Province dropdown
        SearchableDropdown(
          label = "Provincia",
          items = state.availableProvinces,
          selectedItem = findProvince(state.request.province_snit_code),
          itemToString = { it.province_name },
          onItemSelected = { province ->
            onEvent(AnalysisFormEvent.ProvinceChanged(province?.province_snit_code))
          },
          modifier = Modifier.fillMaxWidth(),
          enabled = state.availableProvinces.isNotEmpty()
        )

        // Canton dropdown – enabled only when a province is selected
        SearchableDropdown(
          label = "Cantón",
          items = filteredCantons,
          selectedItem = findCanton(state.request.canton_snit_code),
          itemToString = { it.canton_name },
          onItemSelected = { canton ->
            onEvent(AnalysisFormEvent.CantonChanged(canton?.canton_snit_code))
          },
          modifier = Modifier.fillMaxWidth(),
          enabled = state.request.province_snit_code != 0 && filteredCantons.isNotEmpty()
        )

        // District dropdown – enabled only when a canton is selected
        SearchableDropdown(
          label = "Distrito",
          items = filteredDistricts,
          selectedItem = findDistrict(state.request.district_snit_code),
          itemToString = { it.district_name },
          onItemSelected = { district ->
            onEvent(AnalysisFormEvent.DistrictChanged(district?.district_snit_code))
          },
          modifier = Modifier.fillMaxWidth(),
          enabled = state.request.canton_snit_code != 0 && filteredDistricts.isNotEmpty()
        )
      }
    }

    FormSection(title = "Relación con el Propietario", icon = Icons.Default.Info) {
      // Relation with owner dropdown – now using SearchableDropdown
      SearchableDropdown(
        label = "Tipo de relación",
        items = relationOptions,
        selectedItem = state.request.relation_with_owner,
        itemToString = { it },
        onItemSelected = { relation ->
          onEvent(AnalysisFormEvent.RelationChanged(relation ?: "Titular"))
        },
        modifier = Modifier.fillMaxWidth(),
        enabled = true
      )
    }

    // Conditionally show Owner Data section only if relation is NOT "Titular"
    if (state.request.relation_with_owner != "Titular") {
      FormSection(title = "Información del Propietario", icon = Icons.Default.Person) {
        CustomTextField(
          value = state.request.owner_name ?: "",
          onValueChange = { onEvent(AnalysisFormEvent.OwnerNameChanged(it)) },
          label = "Nombre completo",
          icon = Icons.Default.AccountCircle
        )
        CustomTextField(
          value = state.request.owner_phone_number ?: "",
          onValueChange = { onEvent(AnalysisFormEvent.OwnerPhoneChanged(it)) },
          label = "Teléfono",
          icon = Icons.Default.Phone,
          keyboardType = KeyboardType.Phone,
          isError = state.fieldErrors["phone"] != null,
          errorMessage = state.fieldErrors["phone"]
        )
        CustomTextField(
          value = state.request.owner_email ?: "",
          onValueChange = { onEvent(AnalysisFormEvent.OwnerEmailChanged(it)) },
          label = "Correo electrónico",
          icon = Icons.Default.Email,
          keyboardType = KeyboardType.Email,
          isError = state.fieldErrors["email"] != null,
          errorMessage = state.fieldErrors["email"]
        )
      }
    }

    FormSection(title = "Observaciones de Campo", icon = Icons.Default.Visibility) {
      // Temperature sensation dropdown
      SearchableDropdown(
        label = "Sensación térmica",
        items = tempOptions,
        selectedItem = state.request.temperature_sensation,
        itemToString = { it },
        onItemSelected = { temp ->
          onEvent(AnalysisFormEvent.TempChanged(temp ?: "Sin Especificar"))
        },
        modifier = Modifier.fillMaxWidth(),
        enabled = true
      )

      Row(
        modifier = Modifier
          .fillMaxWidth()
          .padding(vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
      ) {
        Column(modifier = Modifier.weight(1f)) {
          Text("Presencia de burbujas", fontWeight = FontWeight.SemiBold)
          Text("¿Se observan burbujas en el agua?", style = MaterialTheme.typography.bodySmall)
        }
        Switch(
          checked = state.request.bubbles,
          onCheckedChange = { onEvent(AnalysisFormEvent.BubblesChanged(it)) },
          colors = SwitchDefaults.colors(checkedThumbColor = Color(0xFFF57C00))
        )
      }
    }

    FormSection(title = "Información ", icon = Icons.Default.Home) {
      // Current usage dropdown
      SearchableDropdown(
        label = "Uso actual",
        items = usageOptions,
        selectedItem = state.request.current_usage,
        itemToString = { it },
        onItemSelected = { usage ->
          onEvent(AnalysisFormEvent.UsageChanged(usage.toString()))
        },
        modifier = Modifier.fillMaxWidth(),
        enabled = true
      )

      CustomTextField(
        value = state.request.details,
        onValueChange = { onEvent(AnalysisFormEvent.DetailsChanged(it)) },
        label = "Detalles adicionales",
        icon = Icons.Default.Description,
        singleLine = false,
        minLines = 1
      )

    }

    FormSection(title = "Información de Ubicación Exacta", icon = Icons.Default.Map) {
      CustomTextField(
        value = state.request.exact_address,
        onValueChange = { onEvent(AnalysisFormEvent.ExactAddressChanged(it)) },
        label = "Dirección exacta",
        icon = Icons.Default.Home,
        singleLine = false,
        minLines = 1
      )

      Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
          CustomTextField(
            value = state.request.latitude.toString(),
            onValueChange = { onEvent(AnalysisFormEvent.LatChanged(it)) },
            label = "Latitud",
            modifier = Modifier.weight(1f),
            keyboardType = KeyboardType.Number,
            readOnly = true,
            isError = state.fieldErrors["location"] != null,
            errorMessage = state.fieldErrors["location"]
          )
          CustomTextField(
            value = state.request.longitude.toString(),
            onValueChange = { onEvent(AnalysisFormEvent.LonChanged(it)) },
            label = "Longitud",
            modifier = Modifier.weight(1f),
            keyboardType = KeyboardType.Number,
            readOnly = true,
            isError = state.fieldErrors["location"] != null,
            errorMessage = state.fieldErrors["location"]
          )
        }

        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
          OutlinedButton(
            onClick = { onEvent(AnalysisFormEvent.UseCurrentLocation) },
            modifier = Modifier.weight(1f),
            shape = RoundedCornerShape(8.dp)
          ) {
            Icon(Icons.Default.MyLocation, contentDescription = null)
            Spacer(Modifier.width(4.dp))
            Text("Obtener Ubicación Actual", style = MaterialTheme.typography.labelSmall)
          }
        }
      }
    }

    Spacer(Modifier.height(4.dp))

    Button(
      onClick = { onEvent(AnalysisFormEvent.Submit) },
      modifier = Modifier
        .fillMaxWidth()
        .height(58.dp),
      shape = RoundedCornerShape(16.dp),
      colors = ButtonDefaults.buttonColors(
        containerColor = MaterialTheme.colorScheme.primary,
        contentColor = MaterialTheme.colorScheme.onPrimary
      ),
      elevation = ButtonDefaults.buttonElevation(
        defaultElevation = 4.dp,
        pressedElevation = 0.dp
      ),
      enabled = !state.isLoading
    ) {
      if (state.isLoading) {
        CircularProgressIndicator(modifier = Modifier.size(24.dp), color = Color.White)
      } else {
        Text("Enviar Solicitud", fontWeight = FontWeight.Bold, letterSpacing = 1.2.sp)
      }
    }

    Spacer(Modifier.height(16.dp))
  }
}