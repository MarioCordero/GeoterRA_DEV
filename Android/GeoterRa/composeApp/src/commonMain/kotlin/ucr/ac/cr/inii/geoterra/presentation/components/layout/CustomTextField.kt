package ucr.ac.cr.inii.geoterra.presentation.components.layout

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp

@Composable
fun CustomTextField(
  value: String,
  onValueChange: (String) -> Unit,
  label: String,
  icon: ImageVector? = null,
  isError: Boolean = false,
  errorMessage: String? = null,
  modifier: Modifier = Modifier,
  keyboardType: KeyboardType = KeyboardType.Text,
  singleLine: Boolean = true,
  minLines: Int = 1
) {
  OutlinedTextField(
    value = value,
    onValueChange = onValueChange,
    label = { Text(label) },
    leadingIcon = icon?.let { { Icon(it, contentDescription = null) } },
    isError = isError,
    supportingText = { if (isError && errorMessage != null) Text(errorMessage) },
    modifier = modifier.fillMaxWidth(),
    shape = RoundedCornerShape(12.dp),
    keyboardOptions = KeyboardOptions(keyboardType = keyboardType),
    singleLine = singleLine,
    minLines = minLines,
    colors = OutlinedTextFieldDefaults.colors(
      focusedBorderColor = MaterialTheme.colorScheme.primary,
      errorBorderColor = MaterialTheme.colorScheme.error
    )
  )
}