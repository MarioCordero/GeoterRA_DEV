package ucr.ac.cr.inii.geoterra.presentation.components.common

import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Error
import androidx.compose.material.icons.filled.Info
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Snackbar
import androidx.compose.material3.SnackbarData
import androidx.compose.material3.SnackbarDuration
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.launch

data class SnackbarMessage(
	val text: String,
	val type: SnackbarType = SnackbarType.INFO
)

/**
 * Defines the visual style of a snackbar.
 */
@Immutable
enum class SnackbarType {
	SUCCESS,
	ERROR,
	INFO
}

/**
 * A wrapper around [SnackbarHostState] that stores the type of the currently shown snackbar.
 *
 * Use this instead of the plain [SnackbarHostState] to keep type information without relying on
 * string prefixes.
 */
class TypedSnackbarHostState {
	val delegate = SnackbarHostState()
	internal var currentType by mutableStateOf<SnackbarType?>(null)
		private set

	suspend fun showSnackbar(
		message: String,
		type: SnackbarType = SnackbarType.INFO,
		actionLabel: String? = null,
		duration: SnackbarDuration = SnackbarDuration.Short
	) {
		currentType = type
		delegate.showSnackbar(message, actionLabel, false, duration)
	}

	suspend fun showSuccessSnackbar(
		message: String,
		actionLabel: String? = null,
		duration: SnackbarDuration = SnackbarDuration.Short
	) = showSnackbar(message, SnackbarType.SUCCESS, actionLabel, duration)

	suspend fun showErrorSnackbar(
		message: String,
		actionLabel: String? = null,
		duration: SnackbarDuration = SnackbarDuration.Short
	) = showSnackbar(message, SnackbarType.ERROR, actionLabel, duration)

	suspend fun showInfoSnackbar(
		message: String,
		actionLabel: String? = null,
		duration: SnackbarDuration = SnackbarDuration.Short
	) = showSnackbar(message, SnackbarType.INFO, actionLabel, duration)

	/**
	 * Dismisses the currently displayed snackbar.
	 */
	fun dismiss() {
		delegate.currentSnackbarData?.dismiss()
	}
}

/**
 * The host composable that renders the snackbar using the type stored in [TypedSnackbarHostState].
 */
@Composable
fun CustomSnackbarHost(
	hostState: TypedSnackbarHostState,
	modifier: Modifier = Modifier
) {
	SnackbarHost(
		hostState = hostState.delegate,
		modifier = modifier,
		snackbar = { snackbarData ->
			val type = hostState.currentType ?: SnackbarType.INFO
			CustomSnackbar(snackbarData, type)
		}
	)
}

@Composable
private fun CustomSnackbar(
	snackbarData: SnackbarData,
	type: SnackbarType
) {
	val message = snackbarData.visuals.message

	val (backgroundColor, contentColor, icon) = when (type) {
		SnackbarType.SUCCESS -> Triple(
			Color(0xFF4CAF50),
			Color.White,
			Icons.Default.CheckCircle
		)
		SnackbarType.ERROR -> Triple(
			MaterialTheme.colorScheme.error,
			MaterialTheme.colorScheme.onError,
			Icons.Default.Error
		)
		SnackbarType.INFO -> Triple(
			MaterialTheme.colorScheme.primaryContainer,
			MaterialTheme.colorScheme.onPrimaryContainer,
			Icons.Default.Info
		)
	}

	Snackbar(
		modifier = Modifier
			.fillMaxWidth()
			.padding(horizontal = 16.dp, vertical = 8.dp),
		shape = RoundedCornerShape(16.dp),
		containerColor = backgroundColor,
		contentColor = contentColor,
		action = snackbarData.visuals.actionLabel?.let { actionLabel ->
			{
				Text(
					text = actionLabel,
					color = contentColor.copy(alpha = 0.8f),
					modifier = Modifier.padding(horizontal = 8.dp)
				)
			}
		},
		dismissAction = snackbarData.visuals.withDismissAction.takeIf { it }?.let {
			{
				// Dismiss is handled by the host
			}
		}
	) {
		Row(
			verticalAlignment = Alignment.CenterVertically,
			modifier = Modifier.padding(vertical = 8.dp)
		) {
			Icon(
				imageVector = icon,
				contentDescription = null,
				tint = contentColor,
				modifier = Modifier.size(24.dp)
			)
			Spacer(modifier = Modifier.width(12.dp))
			Text(
				text = message,
				style = MaterialTheme.typography.bodyMedium
			)
		}
	}
}