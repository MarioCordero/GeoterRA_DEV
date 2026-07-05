package ucr.ac.cr.inii.geoterra.presentation.components.map

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.animateDpAsState
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Layers
import androidx.compose.material.icons.filled.Map
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.launch
import ucr.ac.cr.inii.geoterra.presentation.components.layout.ActionButton
import ucr.ac.cr.inii.geoterra.presentation.components.layout.SectionHeader
import ucr.ac.cr.inii.geoterra.presentation.screens.map.MapLayer
import ucr.ac.cr.inii.geoterra.presentation.screens.map.MapState

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FilterBottomModal(
  isVisible: Boolean,
  state: MapState,
  onRegionSelected: (UInt) -> Unit,
  onLayerSelected: (String) -> Unit,
  onClearSelectedRegion: () -> Unit,
  onDismiss: () -> Unit,
  onApplyFilters: () -> Unit,
  sheetState: SheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
) {
  val scope = rememberCoroutineScope()

  if (isVisible) {
    ModalBottomSheet(
      onDismissRequest = {
        scope.launch { sheetState.hide() }.invokeOnCompletion { onDismiss() }
      },
      sheetState = sheetState,
      containerColor = MaterialTheme.colorScheme.surface,
      shape = RoundedCornerShape(topStart = 32.dp, topEnd = 32.dp),
      dragHandle = { BottomSheetDefaults.DragHandle(width = 40.dp) }
    ) {
      Column(
        modifier = Modifier
          .fillMaxWidth()
          .padding(horizontal = 24.dp)
          .padding(bottom = 32.dp)
      ) {
        // --- Header ---
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Text(
            text = "Configuración de Mapa",
            style = MaterialTheme.typography.headlineSmall.copy(
              fontWeight = FontWeight.ExtraBold,
              letterSpacing = (-0.5).sp
            )
          )
        }

        Spacer(modifier = Modifier.height(24.dp))

        SectionHeader(title = "Capas", icon = Icons.Default.Map)

        Spacer(modifier = Modifier.height(12.dp))

        LazyRow(
          horizontalArrangement = Arrangement.spacedBy(12.dp),
          contentPadding = PaddingValues(horizontal = 24.dp)
        ) {
          items(state.availableStyleLayers) { layer ->
            TileCard(
              layer = layer,
              isSelected = layer.id == state.selectedLayerId,
              onSelect = { onLayerSelected(layer.id) }
            )
          }
        }

        Spacer(modifier = Modifier.height(32.dp))

        // --- Sección: Regiones ---
        SectionHeader(title = "Región", icon = Icons.Default.Map)
        Spacer(modifier = Modifier.height(12.dp))

        LazyRow(
          horizontalArrangement = Arrangement.spacedBy(12.dp),
          contentPadding = PaddingValues(horizontal = 24.dp),
          modifier = Modifier.fillMaxWidth()
        ) {
          items(state.availableRegions) { region ->
            ModernRegionChip(
              region = region.first,
              isSelected = region.second == state.selectedRegionId,
              onSelect = { onRegionSelected(region.second) }
            )
          }
        }
        Spacer(modifier = Modifier.height(32.dp))

        ActionButton(
          onClick = {
            scope.launch { sheetState.hide() }.invokeOnCompletion { onApplyFilters() }
          },
          text = "Aplicar",
          isLoading = false,
          modifier = Modifier.fillMaxWidth()
        )
      }
    }
  }
}

@Composable
fun TileCard(
  layer: MapLayer,
  isSelected: Boolean,
  onSelect: () -> Unit
) {
  val borderWidth by animateDpAsState(if (isSelected) 2.dp else 1.dp, label = "borderWidth")
  val borderColor by animateColorAsState(
    if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.outline,
    label = "borderColor"
  )

  Column(
    horizontalAlignment = Alignment.CenterHorizontally,
    modifier = Modifier
      .width(110.dp)
      .clip(RoundedCornerShape(20.dp))
      .clickable { onSelect() }
  ) {
    Box(
      modifier = Modifier
        .size(90.dp)
        .background(
          if (isSelected) MaterialTheme.colorScheme.primaryContainer
          else MaterialTheme.colorScheme.surfaceVariant,
          RoundedCornerShape(20.dp)
        )
        .border(borderWidth, borderColor, RoundedCornerShape(20.dp)),
      contentAlignment = Alignment.Center
    ) {
      Icon(
        imageVector = Icons.Default.Layers,
        contentDescription = null,
        modifier = Modifier.size(32.dp),
        tint = if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.outline
      )

      if (isSelected) {
        Icon(
          Icons.Default.CheckCircle,
          contentDescription = null,
          modifier = Modifier
            .align(Alignment.TopEnd)
            .padding(8.dp)
            .size(20.dp),
          tint = MaterialTheme.colorScheme.primary
        )
      }
    }
    Spacer(modifier = Modifier.height(8.dp))
    Text(
      text = layer.name,
      style = MaterialTheme.typography.bodySmall.copy(
        fontWeight = if (isSelected) FontWeight.ExtraBold else FontWeight.Medium,
        textAlign = TextAlign.Center
      ),
      color = if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurface
    )
  }
}

@Composable
fun ModernRegionChip(
  region: String,
  isSelected: Boolean,
  onSelect: () -> Unit
) {
  val containerColor by animateColorAsState(
    if (isSelected) MaterialTheme.colorScheme.primary
    else MaterialTheme.colorScheme.surfaceVariant,
    label = "containerColor"
  )
  val contentColor by animateColorAsState(
    if (isSelected) MaterialTheme.colorScheme.onPrimary
    else MaterialTheme.colorScheme.outline,
    label = "contentColor"
  )
  // Animación de elevación sutil para el feedback táctil
  val elevation by animateDpAsState(if (isSelected) 4.dp else 0.dp)

  Surface(
    modifier = Modifier
      .wrapContentWidth()
      .height(48.dp)
      .clickable { onSelect() },
    color = containerColor,
    shape = RoundedCornerShape(12.dp),
    shadowElevation = elevation,
    border = if (!isSelected) BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f)) else null
  ) {
    Box(
      contentAlignment = Alignment.Center,
      modifier = Modifier.padding(horizontal = 20.dp)
    ) {
      Text(
        text = region,
        style = MaterialTheme.typography.labelLarge.copy(
          fontWeight = if (isSelected) FontWeight.ExtraBold else FontWeight.Medium,
          letterSpacing = 0.2.sp
        ),
        color = contentColor,
        textAlign = TextAlign.Center
      )
    }
  }
}