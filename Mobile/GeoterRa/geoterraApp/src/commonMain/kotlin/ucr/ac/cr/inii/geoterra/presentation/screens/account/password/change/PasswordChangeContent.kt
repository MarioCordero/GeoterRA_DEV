package ucr.ac.cr.inii.geoterra.presentation.screens.account.password.change

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.wrapContentHeight
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import ucr.ac.cr.inii.geoterra.presentation.components.common.ActionButton
import ucr.ac.cr.inii.geoterra.presentation.components.common.FormSection
import ucr.ac.cr.inii.geoterra.presentation.components.common.PasswordField

@Composable
fun ChangePasswordContent(
	modifier: Modifier = Modifier,
	state: PasswordChangeState,
	onCurrentPasswordChanged: (String) -> Unit,
	onNewPasswordChanged: (String) -> Unit,
	onConfirmPasswordChanged: (String) -> Unit,
	onChangePasswordClick: () -> Unit,
	onTogglePassword: () -> Unit
) {
	Column(
		modifier = modifier
			.fillMaxSize()
			.verticalScroll(rememberScrollState()),
		horizontalAlignment = Alignment.CenterHorizontally,
		verticalArrangement = Arrangement.Center
	) {
		Surface(
			modifier = Modifier
				.fillMaxWidth()
				.wrapContentHeight(),
			shape = RoundedCornerShape(32.dp),
			color = MaterialTheme.colorScheme.surface,
		) {
			Column(
				modifier = Modifier.padding(24.dp),
				horizontalAlignment = Alignment.CenterHorizontally,
				verticalArrangement = Arrangement.spacedBy(16.dp)
			) {
				Column(
					modifier = Modifier.fillMaxWidth(),
					horizontalAlignment = Alignment.CenterHorizontally,
					verticalArrangement = Arrangement.spacedBy(4.dp)
				) {
					Text(
						text = "Ingresa tu contraseña actual y la nueva contraseña",
						style = MaterialTheme.typography.bodySmall,
						color = MaterialTheme.colorScheme.onSurface,
						modifier = Modifier.padding(horizontal = 16.dp)
					)
				}

				FormSection {
					PasswordField(
						value = state.currentPassword,
						onValueChange = onCurrentPasswordChanged,
						label = "Contraseña Actual",
						isVisible = state.isPasswordVisible,
						onToggleVisibility = onTogglePassword,
						isError = state.fieldErrors["currentPassword"] != null,
						errorMessage = state.fieldErrors["currentPassword"],
						modifier = Modifier.fillMaxWidth()
					)

					PasswordField(
						value = state.newPassword,
						onValueChange = onNewPasswordChanged,
						label = "Nueva Contraseña",
						isVisible = state.isPasswordVisible,
						onToggleVisibility = onTogglePassword,
						isError = state.fieldErrors["newPassword"] != null,
						errorMessage = state.fieldErrors["newPassword"],
						modifier = Modifier.fillMaxWidth()
					)

					PasswordField(
						value = state.confirmPassword,
						onValueChange = onConfirmPasswordChanged,
						label = "Confirmar Contraseña",
						isVisible = state.isPasswordVisible,
						onToggleVisibility = onTogglePassword,
						modifier = Modifier.fillMaxWidth()
					)
				}

				Column(
					modifier = Modifier.fillMaxWidth(),
					horizontalAlignment = Alignment.CenterHorizontally,
					verticalArrangement = Arrangement.spacedBy(2.dp)
				) {
					ActionButton(
						isLoading = state.isLoading,
						text = "Cambiar Contraseña",
						onClick = onChangePasswordClick
					)
				}
			}
		}

		Spacer(modifier = Modifier.height(16.dp))
	}
}