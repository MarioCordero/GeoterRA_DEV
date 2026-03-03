package ucr.ac.cr.inii.geoterra.presentation.screens.register

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.wrapContentHeight
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import geoterra.composeapp.generated.resources.Res
import geoterra.composeapp.generated.resources.logo_GeoterRA
import geoterra.composeapp.generated.resources.rocks
import org.jetbrains.compose.resources.painterResource
import ucr.ac.cr.inii.geoterra.presentation.components.layout.AdaptiveBackButton
import ucr.ac.cr.inii.geoterra.presentation.components.layout.CustomTextField
import ucr.ac.cr.inii.geoterra.presentation.components.layout.FormSection
import ucr.ac.cr.inii.geoterra.presentation.components.layout.PasswordField

@Composable
fun RegisterContent(
  modifier: Modifier = Modifier,
  state: RegisterState,
  onEvent: RegisterViewModel,
  onBack: () -> Unit
) {
  val snackbarHostState = remember { SnackbarHostState() }

  LaunchedEffect(state.snackbarMessage) {
    state.snackbarMessage?.let {
      snackbarHostState.showSnackbar(it)
      onEvent.dismissSnackbar()
    }
  }

  Column(
    modifier = modifier
      .fillMaxSize()
      .padding(horizontal = 32.dp)
      .imePadding()
      .verticalScroll(rememberScrollState()),
    horizontalAlignment = Alignment.CenterHorizontally,
    verticalArrangement = Arrangement.Center
  ) {
    Spacer(modifier = Modifier.height(48.dp))

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
          text = "Crear Cuenta",
          style = MaterialTheme.typography.headlineSmall,
          fontWeight = FontWeight.ExtraBold
        )

        FormSection {
          CustomTextField(
            value = state.name,
            onValueChange = onEvent::onNameChanged,
            label = "Nombre",
            isError = state.nameError != null,
            errorMessage = state.nameError
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
            isError = state.emailError != null,
            errorMessage = state.emailError
          )
          CustomTextField(
            value = state.phoneNumber,
            onValueChange = onEvent::onPhoneChanged,
            label = "Teléfono (Opcional)",
            keyboardType = KeyboardType.Phone
          )
          PasswordField(
            value = state.password,
            onValueChange = onEvent::onPasswordChanged,
            label = "Contraseña",
            isVisible = state.isPasswordVisible,
            onToggleVisibility = onEvent::togglePasswordVisibility,
            isError = state.passwordError != null,
            errorMessage = state.passwordError
          )
          PasswordField(
            value = state.confirmPassword,
            onValueChange = onEvent::onConfirmPasswordChanged,
            label = "Confirmar Contraseña",
            isVisible = state.isPasswordVisible,
            onToggleVisibility = onEvent::togglePasswordVisibility
          )
        }

        Button(
          onClick = { onEvent.register(onBack) },
          modifier = Modifier.fillMaxWidth().height(56.dp),
          shape = RoundedCornerShape(16.dp),
          enabled = !state.isLoading
        ) {
          if (state.isLoading) CircularProgressIndicator(modifier = Modifier.size(24.dp), color = Color.White)
          else Text("REGISTRARME", fontWeight = FontWeight.Bold)
        }

        TextButton(onClick = onBack) {
          Text("¿Ya tienes cuenta? Inicia sesión", color = MaterialTheme.colorScheme.onSurface)
        }
      }
    }
  }
}