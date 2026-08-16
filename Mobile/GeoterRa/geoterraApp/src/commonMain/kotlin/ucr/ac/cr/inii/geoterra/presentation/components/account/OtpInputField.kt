package ucr.ac.cr.inii.geoterra.presentation.components.account

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp

@Composable
fun OtpInputField(
	modifier: Modifier = Modifier,
	otpText: String,
	otpLength: Int = 6,
	onOtpTextChange: (String) -> Unit,
	isError: Boolean = false,
	errorMessage: String? = null
) {
	BasicTextField(
		modifier = modifier,
		value = otpText,
		onValueChange = {
			if (it.length <= otpLength && it.all { char -> char.isDigit() }) {
				onOtpTextChange(it)
			}
		},
		keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
		decorationBox = {
			Column(
				modifier = Modifier.fillMaxWidth(),
				horizontalAlignment = Alignment.CenterHorizontally,
				verticalArrangement = Arrangement.spacedBy(8.dp)
			) {
				Row(
					modifier = Modifier.fillMaxWidth(),
					horizontalArrangement = Arrangement.spacedBy(8.dp),
					verticalAlignment = Alignment.CenterVertically
				) {
					repeat(otpLength) { index ->
						val char = when {
							index >= otpText.length -> ""
							else -> otpText[index].toString()
						}
						val isFocused = otpText.length == index

						Surface(
							modifier = Modifier
								.weight(1f)
								.height(56.dp),
							shape = RoundedCornerShape(8.dp),
							color = if (isFocused) MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.3f) else MaterialTheme.colorScheme.surfaceVariant,
							border = BorderStroke(
								width = if (isFocused || isError) 2.dp else 1.dp,
								color = when {
									isError -> MaterialTheme.colorScheme.error
									isFocused -> MaterialTheme.colorScheme.primary
									else -> MaterialTheme.colorScheme.outline.copy(alpha = 0.5f)
								}
							)
						) {
							Box(contentAlignment = Alignment.Center) {
								Text(
									text = char,
									style = MaterialTheme.typography.titleLarge,
									color = MaterialTheme.colorScheme.onSurface,
									textAlign = TextAlign.Center
								)
							}
						}
					}
				}
				if (isError && errorMessage != null) {
					Text(
						text = errorMessage,
						style = MaterialTheme.typography.bodySmall,
						color = MaterialTheme.colorScheme.error
					)
				}
			}
		}
	)
}