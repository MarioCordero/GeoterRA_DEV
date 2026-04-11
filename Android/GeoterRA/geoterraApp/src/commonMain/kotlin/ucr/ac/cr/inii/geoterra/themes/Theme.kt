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
  onPrimaryContainer = DarkOnPrimaryContainer,
  
  secondary = DarkSecondary,
  onSecondary = DarkOnSecondary,
  secondaryContainer = DarkSecondaryContainer,
  onSecondaryContainer = DarkOnSecondaryContainer,

  background = DarkBackground,
  surface = DarkSurface,
  onSurface = DarkOnSurface,
  surfaceVariant = DarkSurfaceVariant,
  onSurfaceVariant = DarkSurfaceVariant,
  
  outline = DarkOutline,
  error = ErrorRed
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