package ucr.ac.cr.inii.geoterra.themes

import androidx.compose.ui.graphics.Color

val BrandDeepBlue = Color(0xFF12457D)    // geoterra_deep_blue
val BrandOrange = Color(0xFFF19B29)      // geoterra_orange
val BrandLightOrange = Color(0xFFF5C280) // geoterra_light_orange
val BrandLightBlue = Color(0xFFA6C3E3)   // geoterra_light_blue

// --- VARIANTES PARA MODO CLARO ---
val LightPrimary = BrandOrange
val LightOnPrimary = Color(0xffffffff)
val LightPrimaryContainer = Color(0xffffffff)
val LightOnPrimaryContainer = Color(0xff000000)
val LightSecondary = BrandDeepBlue
val LightOnSecondary = Color(0xffffffff)
val LightSecondaryContainer = Color(0xffffffff)
val LightOnSecondaryContainer = BrandDeepBlue
val LightTertiary = Color(0xFF006A6A)
val LightBackground = Color(0xffffffff)
val LightSurface = Color(0xfff9f9fd)
val LightOnSurface = Color(0xFF1A1C1E)
val LightSurfaceVariant = Color(0xffebebf2)
val LightOutline = Color(0xff74777f)
val LightOutlineVariant = Color(0xFFC4C6CF)

// --- VARIANTES PARA MODO OSCURO (Desaturados y Luminosos) ---
val DarkPrimary = BrandOrange
val DarkOnPrimary = Color(0xFF1B1B1F)
val DarkPrimaryContainer = Color(0xFF1B1B1F)
val DarkOnPrimaryContainer = Color(0xffffffff)
val DarkSecondary = BrandDeepBlue
val DarkOnSecondary = Color(0xFF002E69)
val DarkSecondaryContainer = Color(0xFF004494)
val DarkOnSecondaryContainer = Color(0xFFD6E3FF)
val DarkBackground = Color(0xFF1B1B1F)
val DarkSurface = Color(0xff212125)
val DarkOnSurface = Color(0xFFE3E2E6)
val DarkSurfaceVariant = Color(0xffd9d8dc)
val DarkOutline = LightOutline

val DarkOutlineVariant = LightOutlineVariant

// --- COLORES DE ESTADO (Semánticos) ---
val SuccessGreen = Color(0xFF4CAF50)
val ErrorRed = Color(0xFFBA1A1A)
val WarningYellow = BrandOrange