package ucr.ac.cr.inii.geoterra.presentation.navigation

import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import cafe.adriel.voyager.navigator.Navigator
import cafe.adriel.voyager.navigator.tab.Tab
import cafe.adriel.voyager.navigator.tab.TabOptions
import cafe.adriel.voyager.transitions.SlideTransition
import geoterra.geoterraapp.generated.resources.Res
import geoterra.geoterraapp.generated.resources.ic_developer_board
import org.jetbrains.compose.resources.painterResource
import ucr.ac.cr.inii.geoterra.presentation.screens.fieldtrip.FieldTripScreen

internal object FieldTripTab : Tab {
	override val key: String = "FieldTripTab"

	override val options: TabOptions
		@Composable
		get() {
			val icon = painterResource(Res.drawable.ic_developer_board)
			return TabOptions(index = 2u, title = "Giras", icon)
		}

	@Composable
	override fun Content() {
		Navigator(remember { FieldTripScreen() }) { navigator ->
			SlideTransition(navigator) { screen ->
				screen.Content()
			}
		}
	}
}