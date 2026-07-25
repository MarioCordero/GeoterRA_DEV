package ucr.ac.cr.inii.geoterra.presentation.screens.account.edit

import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.wrapContentHeight
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import geoterra.geoterraapp.generated.resources.Res
import geoterra.geoterraapp.generated.resources.logo_GeoterRA
import org.jetbrains.compose.resources.painterResource
import ucr.ac.cr.inii.geoterra.presentation.components.common.ActionButton
import ucr.ac.cr.inii.geoterra.presentation.components.common.CustomTextField
import ucr.ac.cr.inii.geoterra.presentation.components.common.FormSection

@Composable
fun EditProfileContent(
  modifier: Modifier = Modifier,
  state: EditAccountState,
  onEvent: EditAccountViewModel,
) {

  Column(
    modifier = modifier
      .fillMaxSize()
      .verticalScroll(rememberScrollState()),
    horizontalAlignment = Alignment.CenterHorizontally,
    verticalArrangement = Arrangement.Center
  ) {
    Spacer(modifier = Modifier.height(16.dp))

    Image(
      painter = painterResource(Res.drawable.logo_GeoterRA),
      contentDescription = null,
      modifier = Modifier.height(80.dp).padding(bottom = 32.dp)
    )

    Surface(
      modifier = Modifier.fillMaxWidth().wrapContentHeight(),
      shape = RoundedCornerShape(32.dp),
      color = MaterialTheme.colorScheme.surface,
    ) {
      Column(
        modifier = Modifier.padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(16.dp)
      ) {

        FormSection(
					title = "Nombre Completo",
					icon = Icons.Default.Person
				) {
          CustomTextField(
            value = state.payload.first_name,
            onValueChange = onEvent::onNameChanged,
            label = "Nombre(s)",
            isError = state.fieldErrors["name"] != null,
            errorMessage = state.fieldErrors["name"]
          )
          CustomTextField(
            value = state.payload.last_name,
            onValueChange = onEvent::onLastnameChanged,
            label = "Apellidos",
            isError = state.fieldErrors["lastname"] != null,
            errorMessage = state.fieldErrors["lastname"]
          )
        }

				FormSection(
					title = "Información de Contacto",
					icon = Icons.Default.Email
				) {
					CustomTextField(
						value = state.payload.email,
						onValueChange = onEvent::onEmailChanged,
						label = "Correo Electrónico",
						keyboardType = KeyboardType.Email,
						isError = state.fieldErrors["email"] != null,
						errorMessage = state.fieldErrors["email"]
					)
					CustomTextField(
						value = state.payload.phone_number ?: "",
						onValueChange = onEvent::onPhoneChanged,
						label = "Teléfono",
						keyboardType = KeyboardType.Phone,
						isError = state.fieldErrors["phone"] != null,
						errorMessage = state.fieldErrors["phone"]
					)
				}

				ActionButton(
					isLoading = state.isLoading,
					text = "Actualizar",
					onClick = onEvent::updateProfile,
				)
      }
    }

    Spacer(modifier = Modifier.height(8.dp))
  }
}