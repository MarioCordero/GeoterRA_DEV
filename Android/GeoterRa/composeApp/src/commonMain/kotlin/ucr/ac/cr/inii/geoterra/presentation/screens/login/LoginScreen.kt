package ucr.ac.cr.inii.geoterra.presentation.screens.login

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import cafe.adriel.voyager.core.screen.Screen
import org.koin.compose.koinInject
import ucr.ac.cr.inii.geoterra.presentation.screens.home.HomeContent
import ucr.ac.cr.inii.geoterra.presentation.screens.home.HomeViewModel

/**
 * Voyager Screen for the Login screen.
 */
class LoginScreen : Screen {

    @Composable
    override fun Content() {
        // Inyectamos el ViewModel correcto para esta pantalla
        val viewModel: LoginViewModel = koinInject()
        // Observamos el estado del login
        val state by viewModel.state.collectAsState()

        // Llamamos al componente UI (LoginContent)
        LoginContent(
            state = state,
            onEmailChanged = viewModel::onEmailChanged,
            onPasswordChanged = viewModel::onPasswordChanged,
            onLoginClick = viewModel::login,
            onTogglePassword = viewModel::togglePasswordVisibility,
            onDismissSnackbar = viewModel::dismissSnackbar
        )
    }
}