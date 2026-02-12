package ucr.ac.cr.inii.geoterra.presentation.screens.home

import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import cafe.adriel.voyager.core.screen.Screen
import org.koin.compose.koinInject

/**
 * Voyager Screen implementation for Home.
 */
class HomeScreen : Screen {

    @Composable
    override fun Content() {

        val viewModel: HomeViewModel = koinInject()
        val state by viewModel.state.collectAsState()

        HomeContent(
            state = state,
            onCardClick = viewModel::onCardSelected
        )
    }
}