package ucr.ac.cr.inii.geoterra.presentation.screens.account.password.recovery

import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.wrapContentHeight
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Password
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import geoterra.geoterraapp.generated.resources.Res
import geoterra.geoterraapp.generated.resources.logo_GeoterRA
import org.jetbrains.compose.resources.painterResource
import ucr.ac.cr.inii.geoterra.presentation.components.account.OtpInputField
import ucr.ac.cr.inii.geoterra.presentation.components.common.ActionButton
import ucr.ac.cr.inii.geoterra.presentation.components.common.CustomTextField
import ucr.ac.cr.inii.geoterra.presentation.components.common.FormSection
import ucr.ac.cr.inii.geoterra.presentation.components.common.PasswordField

@Composable
fun PasswordRecoveryContent(
	modifier: Modifier = Modifier,
	state: PasswordRecoveryState,
	onEmailChanged: (String) -> Unit,
	onTokenChanged: (String) -> Unit,
	onPasswordChanged: (String) -> Unit,
	onConfirmPasswordChanged: (String) -> Unit,
	onRequestCodeClick: () -> Unit,
	onResetPasswordClick: () -> Unit,
	onTogglePassword: () -> Unit,
	onBackToLoginClick: () -> Unit
) {
	Column(
		modifier = modifier
			.fillMaxSize()
			.verticalScroll(rememberScrollState()),
		horizontalAlignment = Alignment.CenterHorizontally,
		verticalArrangement = Arrangement.Center
	) {
		Spacer(modifier = Modifier.height(16.dp))

		Image(
			painter = painterResource(Res.drawable.logo_GeoterRA),
			contentDescription = null,
			modifier = Modifier
				.height(80.dp)
				.padding(bottom = 32.dp)
		)

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
						text = if (state.step == PasswordRecoveryState.Step.REQUEST_EMAIL) {
							"Ingresa tu correo para recibir un código de recuperación"
						} else {
							"Ingresa el código OTP y tu nueva contraseña"
						},
						style = MaterialTheme.typography.bodySmall,
						color = MaterialTheme.colorScheme.onSurface,
						modifier = Modifier.padding(horizontal = 16.dp)
					)
				}

				FormSection {
					if (state.step == PasswordRecoveryState.Step.REQUEST_EMAIL) {
						CustomTextField(
							value = state.email,
							onValueChange = onEmailChanged,
							label = "Correo Electrónico",
							keyboardType = KeyboardType.Email,
							isError = state.fieldErrors["email"] != null,
							errorMessage = state.fieldErrors["email"],
							modifier = Modifier.fillMaxWidth()
						)
					} else {
						OtpInputField(
							otpText = state.token,
							onOtpTextChange = onTokenChanged,
							isError = state.fieldErrors["token"] != null,
							errorMessage = state.fieldErrors["token"],
							modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp)
						)

						PasswordField(
							value = state.newPassword,
							onValueChange = onPasswordChanged,
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
				}

				Column(
					modifier = Modifier.fillMaxWidth(),
					horizontalAlignment = Alignment.CenterHorizontally,
					verticalArrangement = Arrangement.spacedBy(2.dp)
				) {
					ActionButton(
						isLoading = state.isLoading,
						text = if (state.step == PasswordRecoveryState.Step.REQUEST_EMAIL) "Enviar Código"
						else "Restablecer Contraseña",
						onClick = if (state.step == PasswordRecoveryState.Step.REQUEST_EMAIL) onRequestCodeClick else onResetPasswordClick
					)

					TextButton(
						onClick = onBackToLoginClick,
						contentPadding = PaddingValues(vertical = 2.dp, horizontal = 8.dp),
						modifier = Modifier.defaultMinSize(minHeight = 1.dp)
					) {
						Text(
							text = buildAnnotatedString {
								append("¿Lo recordaste? ")
								withStyle(style = SpanStyle(fontWeight = FontWeight.Bold)) {
									append("Inicia sesión")
								}
							},
							color = MaterialTheme.colorScheme.onSurface,
							style = MaterialTheme.typography.bodySmall
						)
					}
				}
			}
		}

		Spacer(modifier = Modifier.height(16.dp))
	}
}