package ucr.ac.cr.inii.geoterra.presentation.screens.editProfile

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
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import geoterra.composeapp.generated.resources.Res
import geoterra.composeapp.generated.resources.logo_GeoterRA
import geoterra.composeapp.generated.resources.logo_GeoterRA_exp
import org.jetbrains.compose.resources.painterResource
import ucr.ac.cr.inii.geoterra.presentation.components.layout.CustomTextField
import ucr.ac.cr.inii.geoterra.presentation.components.layout.FormSection

@Composable
fun EditProfileContent(
  modifier: Modifier = Modifier,
  state: EditProfileState,
  snackBarState : SnackbarHostState,
  onEvent: EditProfileViewModel,
  onBack: () -> Unit
) {
  LaunchedEffect(state.snackBarMessage) {
    state.snackBarMessage?.let { message ->
      snackBarState.showSnackbar(message)
      onEvent.dismissSnackbar()
    }
  }

  Column(
    modifier = modifier
      .fillMaxSize()
      .padding(horizontal = 32.dp)
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
        Text(
          text = "Editar Cuenta",
          style = MaterialTheme.typography.headlineSmall,
          fontWeight = FontWeight.ExtraBold
        )

        FormSection {
          CustomTextField(
            value = state.name,
            onValueChange = onEvent::onNameChanged,
            label = "Nombre",
            isError = state.fieldErrors["name"] != null,
            errorMessage = state.fieldErrors["name"]
          )
          CustomTextField(
            value = state.lastname,
            onValueChange = onEvent::onLastnameChanged,
            label = "Apellidos"
          )
          CustomTextField(
            value = state.email,
            onValueChange = onEvent::onEmailChanged,
            label = "Correo Electrónico",
            keyboardType = KeyboardType.Email,
            isError = state.fieldErrors["email"] != null,
            errorMessage = state.fieldErrors["email"]
          )
          CustomTextField(
            value = state.phoneNumber,
            onValueChange = onEvent::onPhoneChanged,
            label = "Teléfono",
            keyboardType = KeyboardType.Phone,
            isError = state.fieldErrors["phone"] != null,
            errorMessage = state.fieldErrors["phone"]
          )
        }

        Button(
          onClick = {onEvent.updateProfile()},
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
            CircularProgressIndicator(modifier = Modifier.size(24.dp),color = Color.White)
          } else {
            Text("ACTUALIZAR", fontWeight = FontWeight.Bold)
          }
        }
      }
    }

    Spacer(modifier = Modifier.height(8.dp))
  }
}