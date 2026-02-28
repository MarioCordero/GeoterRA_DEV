package ucr.ac.cr.inii.geoterra.presentation.screens.home

import androidx.compose.foundation.Image
import androidx.compose.foundation.ScrollState
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import geoterra.composeapp.generated.resources.Res
import geoterra.composeapp.generated.resources.ic_geoterra_planet
import geoterra.composeapp.generated.resources.logo_GeoterRA
import geoterra.composeapp.generated.resources.rocks
import org.jetbrains.compose.resources.painterResource
import ucr.ac.cr.inii.geoterra.presentation.components.layout.StepItem

/**
 * Pure UI composable for Home screen.
 *
 * This function is fully platform-agnostic.
 */
@Composable
fun HomeContent(
  state: HomeState,
  onCardMapClick: () -> Unit
) {
  val scrollState = rememberScrollState()
  
  Column(
    modifier = Modifier
      .fillMaxSize()
      .background(MaterialTheme.colorScheme.background)
      .verticalScroll(scrollState)
  ) {
    // --- SECCIÓN 1: HERO (Encabezado Impactante) ---
    Box(
      modifier = Modifier
        .fillMaxWidth()
        .height(400.dp)
    ) {
      Image(
        painter = painterResource(Res.drawable.rocks),
        contentDescription = null,
        contentScale = ContentScale.Crop,
        modifier = Modifier.fillMaxSize()
      )
      // Degradado para que el texto sea legible sobre la imagen
      Box(
        modifier = Modifier
          .fillMaxSize()
          .background(
            Brush.verticalGradient(
              colors = listOf(Color.Transparent, Color.Black.copy(alpha = 0.7f))
            )
          )
      )
      Column(
        modifier = Modifier
          .align(Alignment.BottomStart)
          .padding(24.dp)
      ) {
        Image(
          painter = painterResource(Res.drawable.logo_GeoterRA),
          contentDescription = null,
          modifier = Modifier.height(40.dp)
        )
        Spacer(modifier = Modifier.height(16.dp))
        Text(
          text = "Navegando el potencial geotérmico hacia un futuro renovable",
          color = Color.White,
          style = MaterialTheme.typography.headlineMedium,
          fontWeight = FontWeight.Bold
        )
      }
    }
    
    // --- SECCIÓN 2: INTRODUCCIÓN Y BOTÓN ACCIÓN ---
    Column(modifier = Modifier.padding(24.dp)) {
      Text(
        text = state.description,
        style = MaterialTheme.typography.bodyLarge,
        lineHeight = 28.sp,
        color = MaterialTheme.colorScheme.onSurface
      )
      Spacer(modifier = Modifier.height(24.dp))
      Button(
        onClick = onCardMapClick,
        modifier = Modifier.fillMaxWidth().height(56.dp),
        shape = RoundedCornerShape(12.dp)
      ) {
        Text("Ver mapa interactivo", fontSize = 18.sp)
      }
    }
    
    // --- SECCIÓN 3: CÓMO FUNCIONA (Pasos) ---
    SectionTitle("Cómo funciona")
    
    StepItem(
      1,
      "Recolección de datos",
      "GeoterRA comienza con la recolección integral de datos geológicos de diversas fuentes."
    )
    StepItem(
      2,
      "Validación y almacenamiento",
      "Los datos pasan por un riguroso proceso de validación y se almacenan en SQL."
    )
    StepItem(
      3,
      "Herramientas avanzadas",
      "Visualización 3D y mapas interactivos para planificación estratégica."
    )
    
    Spacer(modifier = Modifier.height(32.dp))
    
    // --- SECCIÓN 4: ACERCA DE NOSOTROS (Card con profundidad) ---
    Card(
      modifier = Modifier.padding(16.dp),
      colors = CardDefaults.cardColors(containerColor = Color(0xFFF5F5F5)),
      shape = RoundedCornerShape(24.dp)
    ) {
      Column(modifier = Modifier.padding(24.dp)) {
        Text(
          text = "Acerca de nosotros",
          style = MaterialTheme.typography.headlineSmall,
          fontWeight = FontWeight.Bold,
          color = MaterialTheme.colorScheme.primary
        )
        Spacer(modifier = Modifier.height(12.dp))
        Text(
          text = "Nuestra misión es proporcionar información geológica precisa para minimizar riesgos y maximizar la eficiencia energética.",
          style = MaterialTheme.typography.bodyMedium
        )
      }
    }
    
    // --- SECCIÓN 5: FOOTER (Información de contacto) ---
    Box(
      modifier = Modifier
        .fillMaxWidth()
        .background(Color(0xFF1C1B1F)) // Fondo oscuro para el footer
        .padding(24.dp)
    ) {
      Column {
        Text("Contacto", color = Color.White, fontWeight = FontWeight.Bold)
        Text("Email: contacto@geoterra.com", color = Color.Gray)
        Text("Ubicación: Costa Rica", color = Color.Gray)
        Spacer(modifier = Modifier.height(16.dp))
        Text(
          text = "© 2021 Instituto de Investigaciones en Ingeniería - UCR",
          color = Color.DarkGray,
          fontSize = 12.sp
        )
      }
    }
  }
}

@Composable
fun SectionTitle(title: String) {
  Text(
    text = title,
    modifier = Modifier.padding(horizontal = 24.dp, vertical = 16.dp),
    style = MaterialTheme.typography.headlineSmall,
    fontWeight = FontWeight.ExtraBold,
    color = MaterialTheme.colorScheme.primary
  )
}