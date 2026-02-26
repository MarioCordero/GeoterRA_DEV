package ucr.ac.cr.inii.geoterra.presentation.components.layout

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp

@Composable
fun PasswordField(
  value: String,
  onValueChange: (String) -> Unit,
  label: String,
  isVisible: Boolean,
  onToggleVisibility: () -> Unit,
  isError: Boolean = false,
  errorMessage: String? = null,
  modifier: Modifier = Modifier
) {
  OutlinedTextField(
    value = value,
    onValueChange = onValueChange,
    label = { Text(label) },
    isError = isError,
    supportingText = { if (isError && errorMessage != null) Text(errorMessage) },
    modifier = modifier.fillMaxWidth(),
    shape = RoundedCornerShape(12.dp),
    singleLine = true,
    visualTransformation = if (isVisible) VisualTransformation.None else PasswordVisualTransformation(),
    trailingIcon = {
      IconButton(onClick = onToggleVisibility) {
        Icon(
          imageVector = if (isVisible) Icons.Filled.Visibility else Icons.Filled.VisibilityOff,
          contentDescription = null,
          tint = MaterialTheme.colorScheme.primary
        )
      }
    },
    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
    colors = OutlinedTextFieldDefaults.colors(
      focusedBorderColor = MaterialTheme.colorScheme.primary
    )
  )
}