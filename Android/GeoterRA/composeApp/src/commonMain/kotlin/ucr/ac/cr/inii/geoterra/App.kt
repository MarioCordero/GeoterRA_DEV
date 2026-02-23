package ucr.ac.cr.inii.geoterra

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.Crossfade
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.safeContentPadding
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import cafe.adriel.voyager.navigator.Navigator
import org.koin.compose.KoinApplication
import org.jetbrains.compose.resources.painterResource

import geoterra.composeapp.generated.resources.Res
import geoterra.composeapp.generated.resources.compose_multiplatform
import org.koin.compose.koinInject
import ucr.ac.cr.inii.geoterra.presentation.MainScreen
import ucr.ac.cr.inii.geoterra.presentation.auth.AuthViewModel
import ucr.ac.cr.inii.geoterra.presentation.screens.login.LoginScreen

// Definición de colores
private val LightColors = lightColorScheme(
  primary = Color(0xFF006400),    // Un verde bosque (ejemplo para GeoterRA)
  onPrimary = Color.White,
  surface = Color.White,          // Fondo de Cards, Menús, etc.
  background = Color.White,       // Fondo principal de la pantalla
  onSurface = Color(0xFF1C1B1F),  // Texto sobre fondo blanco
  onBackground = Color(0xFF1C1B1F)
)

/**
 * Root composable for all platforms.
 * Dependency injection MUST be initialized by the platform.
 */
@Composable
fun App() {
  MaterialTheme(colorScheme = LightColors) {
    Navigator(screen = MainScreen())
  }
}