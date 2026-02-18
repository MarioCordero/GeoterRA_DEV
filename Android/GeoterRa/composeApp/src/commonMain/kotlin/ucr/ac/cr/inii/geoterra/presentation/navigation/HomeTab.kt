package ucr.ac.cr.inii.geoterra.presentation.navigation


import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import cafe.adriel.voyager.navigator.tab.Tab
import cafe.adriel.voyager.navigator.tab.TabOptions
import geoterra.composeapp.generated.resources.Res
import geoterra.composeapp.generated.resources.ic_contract
import geoterra.composeapp.generated.resources.ic_home
import org.jetbrains.compose.resources.painterResource
import ucr.ac.cr.inii.geoterra.presentation.screens.home.HomeScreen

internal object HomeTab : Tab {
    override val options: TabOptions
        @Composable
        get() {
            val icon = painterResource(Res.drawable.ic_home)
            return TabOptions(index = 0u, title = "Inicio", icon)
        }

    @Composable
    override fun Content() {
        HomeScreen().Content()
    }
}