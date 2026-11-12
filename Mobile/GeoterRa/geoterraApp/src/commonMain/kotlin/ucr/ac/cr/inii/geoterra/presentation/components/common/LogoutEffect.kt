package ucr.ac.cr.inii.geoterra.presentation.components.common

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.rememberUpdatedState
import org.koin.compose.koinInject
import ucr.ac.cr.inii.geoterra.domain.auth.AuthEventBus

@Composable
fun LogoutEffect(onLogout: () -> Unit) {
	val authEventBus = koinInject<AuthEventBus>()
	val isLoggedIn by authEventBus.isLoggedIn.collectAsState()
	val currentOnLogout by rememberUpdatedState(onLogout)

	LaunchedEffect(isLoggedIn) {
		if (isLoggedIn == false) {
			currentOnLogout()
		}
	}
}