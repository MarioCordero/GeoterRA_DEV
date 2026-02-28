package ucr.ac.cr.inii.geoterra.presentation.screens.login

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Info
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
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
  onTogglePassword: () -> Unit,
  onDismissSnackbar: () -> Unit,
) {
  val snackbarHostState = remember { SnackbarHostState() }
  
  // When snackbarMessage changes and is not null, show the snackbar
  LaunchedEffect(state.snackbarMessage) {
    state.snackbarMessage?.let {
      snackbarHostState.showSnackbar(message = it)
      onDismissSnackbar() // Reset state after showing
    }
  }
  
  Scaffold(
    snackbarHost = { SnackbarHost(snackbarHostState) }
  ) { padding ->
    Box(modifier = Modifier.fillMaxSize().padding(padding)) {
      Image(
        painter = painterResource(Res.drawable.rocks),
        contentDescription = null,
        contentScale = ContentScale.Crop,
        modifier = Modifier.fillMaxSize()
      )
      
      Box(modifier = Modifier.fillMaxSize().background(Color.Black.copy(alpha = 0.5f)))
      
      Column(
        modifier = Modifier
          .fillMaxSize()
          .padding(24.dp)
          .imePadding(),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
      ) {

        Image(
          painter = painterResource(Res.drawable.logo_GeoterRA),
          contentDescription = "Logo",
          modifier = Modifier.height(70.dp).padding(bottom = 32.dp)
        )
        
        Card(
          shape = RoundedCornerShape(28.dp),
          colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
          elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
        ) {
          Column(
            modifier = Modifier.padding(28.dp),
            horizontalAlignment = Alignment.CenterHorizontally
          ) {
            
            FormSection(title = "Iniciar Sesión", icon = Icons.Default.Info) {
              CustomTextField(
                value = state.email,
                onValueChange = onEmailChanged,
                label = "Correo Electrónico",
                keyboardType = KeyboardType.Email,
                isError = state.emailError != null,
                errorMessage = state.emailError
              )

              PasswordField(
                value = state.password,
                onValueChange = onPasswordChanged,
                label = "Contraseña",
                isVisible = state.isPasswordVisible,
                onToggleVisibility = onTogglePassword,
                isError = state.passwordError != null,
                errorMessage = state.passwordError
              )
            }
            
            Spacer(modifier = Modifier.height(24.dp))
            
            // Botón de Entrar
            Button(
              onClick = onLoginClick,
              modifier = Modifier.fillMaxWidth().height(56.dp),
              shape = RoundedCornerShape(14.dp),
              enabled = !state.isLoading
            ) {
              if (state.isLoading) {
                CircularProgressIndicator(modifier = Modifier.size(24.dp), strokeWidth = 2.dp)
              } else {
                Text("Ingresar", fontSize = 16.sp, fontWeight = FontWeight.Bold)
              }
            }
          }
        }
      }
    }
  }
}