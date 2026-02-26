package ucr.ac.cr.inii.geoterra.themes

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val LightColors = lightColorScheme(
  primary = LightPrimary,
  onPrimary = LightOnPrimary,
  primaryContainer = LightPrimaryContainer,
  onPrimaryContainer = LightOnPrimaryContainer,
  
  secondary = LightSecondary,
  onSecondary = LightOnSecondary,
  secondaryContainer = LightSecondaryContainer,
  onSecondaryContainer = LightOnSecondaryContainer,
  
  tertiary = LightTertiary,
  background = LightBackground,
  surface = LightSurface,
  surfaceVariant = LightSurfaceVariant,
  onSurface = LightOnSurface,
  onSurfaceVariant = LightSurfaceVariant,
  
  outline = LightOutline,
  outlineVariant = LightOutlineVariant,
  error = ErrorRed
)

private val DarkColors = darkColorScheme(
  primary = DarkPrimary,
  onPrimary = DarkOnPrimary,
  primaryContainer = DarkPrimaryContainer,
  onPrimaryContainer = Color(0xFFD6E3FF),
  
  secondary = DarkSecondary,
  onSecondary = DarkOnSecondary,
  secondaryContainer = Color(0xFF634400),
  onSecondaryContainer = BrandLightOrange,
  
  background = DarkBackground,
  surface = DarkSurface,
  onSurface = Color(0xFFE2E2E6),
  onSurfaceVariant = Color(0xFFC4C6CF),
  
  outline = DarkOutline,
  error = Color(0xFFFFB4AB)
)

@Composable
fun GeoterraTheme(
  useDarkTheme: Boolean = isSystemInDarkTheme(),
  content: @Composable () -> Unit
) {
  val colors = if (!useDarkTheme) LightColors else DarkColors
  
  MaterialTheme(
    colorScheme = colors,
    // Aquí puedes agregar también configuraciones de Typography y Shapes
    content = content
  )
}