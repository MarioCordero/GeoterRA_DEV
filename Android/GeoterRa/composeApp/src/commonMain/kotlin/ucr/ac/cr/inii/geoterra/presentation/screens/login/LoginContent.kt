package ucr.ac.cr.inii.geoterra.presentation.screens.login

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
import androidx.compose.foundation.layout.wrapContentHeight
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.material.icons.filled.Info
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
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
import androidx.compose.ui.unit.sp
import geoterra.composeapp.generated.resources.Res
import geoterra.composeapp.generated.resources.logo_GeoterRA
import geoterra.composeapp.generated.resources.rocks
import org.jetbrains.compose.resources.painterResource
import ucr.ac.cr.inii.geoterra.presentation.components.layout.CustomTextField
import ucr.ac.cr.inii.geoterra.presentation.components.layout.FormSection
import ucr.ac.cr.inii.geoterra.presentation.components.layout.PasswordField

@Composable
fun LoginContent(
  state: LoginState,
  onEmailChanged: (String) -> Unit,
  onPasswordChanged: (String) -> Unit,
  onLoginClick: () -> Unit,
  onRegisterClick: () -> Unit,
  onTogglePassword: () -> Unit,
  onDismissSnackbar: () -> Unit,
) {
  val snackbarHostState = remember { SnackbarHostState() }

  LaunchedEffect(state.snackbarMessage) {
    state.snackbarMessage?.let {
      snackbarHostState.showSnackbar(message = it)
      onDismissSnackbar()
    }
  }

  Scaffold(
    modifier = Modifier.fillMaxSize(),
    containerColor = Color.Transparent,
    snackbarHost = { SnackbarHost(snackbarHostState) }
  ) { padding ->
    Box(modifier = Modifier.fillMaxSize()) {
      Image(
        painter = painterResource(Res.drawable.rocks),
        contentDescription = null,
        contentScale = ContentScale.Crop,
        modifier = Modifier.fillMaxSize()
      )

      Box(
        modifier = Modifier
          .fillMaxSize()
          .background(
            Brush.verticalGradient(
              colors = listOf(
                Color.Black.copy(alpha = 0.3f),
                Color.Black.copy(alpha = 0.7f)
              )
            )
          )
      )

      Column(
        modifier = Modifier
          .fillMaxSize()
          .padding(horizontal = 32.dp)
          .imePadding()
          .verticalScroll(rememberScrollState()),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
      ) {

        Image(
          painter = painterResource(Res.drawable.logo_GeoterRA),
          contentDescription = "GeoterRA Logo",
          modifier = Modifier
            .height(100.dp)
            .padding(bottom = 48.dp)
        )

        Surface(
          modifier = Modifier.fillMaxWidth().wrapContentHeight(),
          shape = RoundedCornerShape(32.dp),
          color = MaterialTheme.colorScheme.background,
          tonalElevation = 8.dp,
          shadowElevation = 12.dp
        ) {
          Column(
            modifier = Modifier.padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
          ) {

            Text(
              text = "Bienvenido de nuevo",
              style = MaterialTheme.typography.headlineSmall.copy(
                fontWeight = FontWeight.ExtraBold,
                letterSpacing = (-0.5).sp
              ),
              color = MaterialTheme.colorScheme.onSurface
            )

            Text(
              text = "Ingresa tus credenciales para continuar",
              style = MaterialTheme.typography.bodySmall,
              color = MaterialTheme.colorScheme.onSurface,
              modifier = Modifier.padding(bottom = 24.dp)
            )

            FormSection() {
              CustomTextField(
                value = state.email,
                onValueChange = onEmailChanged,
                label = "Correo Electrónico",
                keyboardType = KeyboardType.Email,
                isError = state.emailError != null,
                errorMessage = state.emailError,
                modifier = Modifier.fillMaxWidth()
              )

              PasswordField(
                value = state.password,
                onValueChange = onPasswordChanged,
                label = "Contraseña",
                isVisible = state.isPasswordVisible,
                onToggleVisibility = onTogglePassword,
                isError = state.passwordError != null,
                errorMessage = state.passwordError,
                modifier = Modifier.fillMaxWidth()
              )
            }

            TextButton(
              onClick = { onRegisterClick() },
            ) {
              Text(
                "¿No tienes cuenta? Regístrate aquí",
                color = MaterialTheme.colorScheme.onSurface,
                style = MaterialTheme.typography.bodyMedium
              )
            }

            Button(
              onClick = onLoginClick,
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
                CircularProgressIndicator(
                  modifier = Modifier.size(24.dp),
                  color = MaterialTheme.colorScheme.onPrimary,
                  strokeWidth = 3.dp
                )
              } else {
                Row(
                  verticalAlignment = Alignment.CenterVertically,
                  horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                  Text(
                    "INGRESAR",
                    style = MaterialTheme.typography.titleMedium.copy(
                      fontWeight = FontWeight.Bold,
                      letterSpacing = 1.2.sp
                    )
                  )
                  Icon(Icons.Default.ArrowForward, contentDescription = null)
                }
              }
            }
          }
        }
      }
    }
  }
}