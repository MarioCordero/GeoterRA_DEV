package ucr.ac.cr.inii.geoterra.presentation.navigation
import androidx.compose.animation.Crossfade
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import cafe.adriel.voyager.navigator.tab.Tab
import cafe.adriel.voyager.navigator.tab.TabOptions
import geoterra.composeapp.generated.resources.Res
import geoterra.composeapp.generated.resources.ic_account
import org.jetbrains.compose.resources.painterResource
import org.koin.compose.koinInject
import androidx.compose.runtime.getValue
import ucr.ac.cr.inii.geoterra.presentation.auth.AuthViewModel
import ucr.ac.cr.inii.geoterra.presentation.screens.login.LoginContent
import ucr.ac.cr.inii.geoterra.presentation.screens.login.LoginViewModel

object AccountTab : Tab {
    @Composable
    override fun Content() {
        // Inyectamos el estado global de autenticación
        val authViewModel = koinInject<AuthViewModel>()
        val isLoggedIn by authViewModel.isLoggedIn.collectAsState()

        Crossfade(targetState = isLoggedIn) { authenticated ->
            if (authenticated) {
                // Si está logueado, mostramos su perfil
//                ProfileScreenContent()
            } else {
                // Si no, mostramos la pantalla de Login dentro de la pestaña
                // Usamos el LoginScreen que ya creamos
                val loginViewModel = koinInject<LoginViewModel>()
                val state by loginViewModel.state.collectAsState()

                LoginContent(
                    state = state,
                    onEmailChanged = loginViewModel::onEmailChanged,
                    onPasswordChanged = loginViewModel::onPasswordChanged,
                    onLoginClick = loginViewModel::login,
                    onTogglePassword = loginViewModel::togglePasswordVisibility,
                    onDismissSnackbar = loginViewModel::dismissSnackbar
                )
            }
        }
    }

    override val options: TabOptions
        @Composable
        get() = TabOptions(
            index = 3u,
            title = "Cuenta",
            icon = painterResource(Res.drawable.ic_account)
        )
}