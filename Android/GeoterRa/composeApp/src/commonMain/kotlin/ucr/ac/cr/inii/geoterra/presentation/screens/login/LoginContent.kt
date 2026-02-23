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
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
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
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import geoterra.composeapp.generated.resources.Res
import geoterra.composeapp.generated.resources.logo_GeoterRA
import geoterra.composeapp.generated.resources.rocks
import org.jetbrains.compose.resources.painterResource


@Composable
fun LoginContent(
  state: LoginState,
  onEmailChanged: (String) -> Unit,
  onPasswordChanged: (String) -> Unit,
  onLoginClick: () -> Unit,
  onTogglePassword: () -> Unit,
  onDismissSnackbar: () -> Unit, // Add this param
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
      
      // Filtro oscuro para resaltar el formulario
      Box(modifier = Modifier.fillMaxSize().background(Color.Black.copy(alpha = 0.5f)))
      
      Column(
        modifier = Modifier
          .fillMaxSize()
          .padding(24.dp)
          .imePadding(), // Evita que el teclado tape los campos
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
      ) {
        // Logo GeoterRA
        Image(
          painter = painterResource(Res.drawable.logo_GeoterRA),
          contentDescription = "Logo",
          modifier = Modifier.height(70.dp).padding(bottom = 32.dp)
        )
        
        Card(
          shape = RoundedCornerShape(28.dp),
          colors = CardDefaults.cardColors(containerColor = Color.White.copy(alpha = 0.95f)),
          elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
        ) {
          Column(
            modifier = Modifier.padding(28.dp),
            horizontalAlignment = Alignment.CenterHorizontally
          ) {
            Text(
              text = "Iniciar Sesión",
              style = MaterialTheme.typography.headlineSmall,
              fontWeight = FontWeight.ExtraBold,
              color = Color(0xFF1B5E20) // Verde oscuro temático
            )
            
            Spacer(modifier = Modifier.height(20.dp))
            
            // Campo de Email
            OutlinedTextField(
              value = state.email,
              onValueChange = onEmailChanged,
              label = { Text("Correo") },
              isError = state.emailError != null,
              supportingText = { state.emailError?.let { Text(it) } },
              modifier = Modifier.fillMaxWidth(),
              shape = RoundedCornerShape(12.dp),
              singleLine = true
            )
            
            Spacer(modifier = Modifier.height(12.dp))
            
            // Campo de Contraseña
            OutlinedTextField(
              value = state.password,
              onValueChange = onPasswordChanged,
              label = { Text("Contraseña") },
              isError = state.passwordError != null,
              supportingText = { state.passwordError?.let { Text(it) } },
              modifier = Modifier.fillMaxWidth(),
              shape = RoundedCornerShape(12.dp),
              singleLine = true,
              visualTransformation = if (state.isPasswordVisible) VisualTransformation.None else PasswordVisualTransformation(),
              trailingIcon = {
                IconButton(onClick = onTogglePassword) {
                  Icon(
                    imageVector = if (state.isPasswordVisible) Icons.Filled.Visibility else Icons.Filled.VisibilityOff,
                    contentDescription = null
                  )
                }
              }
            )
            
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