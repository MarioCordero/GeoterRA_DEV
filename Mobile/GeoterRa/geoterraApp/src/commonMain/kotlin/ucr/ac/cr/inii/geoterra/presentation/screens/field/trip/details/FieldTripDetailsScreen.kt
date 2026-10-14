package ucr.ac.cr.inii.geoterra.presentation.screens.fieldtrip.details

import androidx.compose.foundation.layout.padding
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import cafe.adriel.voyager.core.screen.Screen
import cafe.adriel.voyager.core.screen.ScreenKey
import cafe.adriel.voyager.core.screen.uniqueScreenKey
import cafe.adriel.voyager.koin.getScreenModel
import org.koin.core.parameter.parametersOf
import ucr.ac.cr.inii.geoterra.data.model.responses.FieldTripResponse
import ucr.ac.cr.inii.geoterra.presentation.components.common.CustomSnackbarHost
import ucr.ac.cr.inii.geoterra.presentation.components.common.TypedSnackbarHostState
import ucr.ac.cr.inii.geoterra.presentation.screens.field.trip.details.FieldTripDetailsViewModel

class FieldTripDetailsScreen(
	private val fieldTrip: FieldTripResponse
) : Screen {
	override val key: ScreenKey = uniqueScreenKey

	@Composable
	override fun Content() {
		val viewModel = getScreenModel<FieldTripDetailsViewModel> { parametersOf(fieldTrip) }
		val state by viewModel.state.collectAsState()
		val snackbarHostState = TypedSnackbarHostState()

		Scaffold(
			snackbarHost = { CustomSnackbarHost(snackbarHostState) }
		) { paddingValues ->
			FieldTripDetailsContent(
				modifier = Modifier
					.padding(paddingValues)
					.padding(horizontal = 20.dp, vertical = 10.dp),
				state = state
			)
		}
	}
}