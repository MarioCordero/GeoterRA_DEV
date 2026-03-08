package ucr.ac.cr.inii.geoterra.presentation.components.layout

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.DrawerDefaults.backgroundColor
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Public
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.MenuDefaults
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import ucr.ac.cr.inii.geoterra.domain.model.regionList

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RegionSelector(
  selectedRegionId: UInt?,
  onRegionSelected: (UInt) -> Unit,
  modifier: Modifier = Modifier
) {
  var expanded by remember { mutableStateOf(false) }
  val selectedName = regionList.find { it.id == selectedRegionId }?.name ?: "Seleccione una región"

  ExposedDropdownMenuBox(
    expanded = expanded,
    onExpandedChange = { expanded = !expanded },
    modifier = modifier.fillMaxWidth()
  ) {
    OutlinedTextField(
      value = selectedName,
      onValueChange = {},
      readOnly = true,
      label = { Text("Región") },
      leadingIcon = { Icon(Icons.Default.Public, contentDescription = null) },
      trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expanded) },
      modifier = Modifier.menuAnchor().fillMaxWidth(),
      shape = RoundedCornerShape(12.dp),
      colors = OutlinedTextFieldDefaults.colors(
        unfocusedLabelColor = MaterialTheme.colorScheme.outline,
        focusedLabelColor = MaterialTheme.colorScheme.primary,
        unfocusedLeadingIconColor = MaterialTheme.colorScheme.outline,
        focusedLeadingIconColor = MaterialTheme.colorScheme.primary,
        focusedBorderColor = MaterialTheme.colorScheme.primary,
        unfocusedBorderColor = MaterialTheme.colorScheme.outline,
        unfocusedTextColor = MaterialTheme.colorScheme.outline,
        focusedContainerColor = MaterialTheme.colorScheme.surface,
        unfocusedContainerColor = MaterialTheme.colorScheme.surface
      )
    )

    ExposedDropdownMenu(
      containerColor = MaterialTheme.colorScheme.surface,
      expanded = expanded,
      onDismissRequest = { expanded = false }
    ) {
      regionList.forEach { region ->
        DropdownMenuItem(
          text = { Text(region.name) },
          onClick = {
            onRegionSelected(region.id)
            expanded = false
          }
        )
      }
    }
  }
}