package ucr.ac.cr.inii.geoterra.presentation.screens.fieldtrip

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import ucr.ac.cr.inii.geoterra.data.model.responses.FieldTripResponse
import ucr.ac.cr.inii.geoterra.presentation.components.fieldtrip.FieldTripCardItem
import ucr.ac.cr.inii.geoterra.presentation.screens.field.trip.FieldTripState
import ucr.ac.cr.inii.geoterra.presentation.screens.field.trip.FieldTripTab

@Composable
fun FieldTripContent(
	modifier: Modifier = Modifier,
	state: FieldTripState,
	onTabSelected: (FieldTripTab) -> Unit,
	onViewDetails: (FieldTripResponse) -> Unit
) {
	val currentList = when (state.currentTab) {
		FieldTripTab.GENERAL -> state.generalFieldTrips
		FieldTripTab.ASSIGNED -> state.myFieldTrips
	}

	Column(
		modifier = modifier.fillMaxSize()
	) {
		TabRow(
			selectedTabIndex = state.currentTab.ordinal,
			modifier = Modifier.fillMaxWidth()
		) {
			FieldTripTab.entries.forEach { tab ->
				Tab(
					selected = state.currentTab == tab,
					onClick = { onTabSelected(tab) },
					text = {
						Text(
							text = tab.title,
							style = MaterialTheme.typography.titleSmall,
							color = if (state.currentTab == tab) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant
						)
					}
				)
			}
		}

		Spacer(modifier = Modifier.height(16.dp))

		Box(
			modifier = Modifier
				.weight(1f)
				.fillMaxWidth()
		) {
			if (state.isLoading && currentList.isEmpty()) {
				CircularProgressIndicator(
					modifier = Modifier.align(Alignment.Center)
				)
			} else if (currentList.isEmpty()) {
				Box(
					modifier = Modifier.fillMaxSize(),
					contentAlignment = Alignment.Center
				) {
					Text(
						text = when (state.currentTab) {
							FieldTripTab.GENERAL -> "No hay giras de campo registradas."
							FieldTripTab.ASSIGNED -> if (!state.isLoggedIn) "Inicia sesión para ver tus giras asignadas." else "No tienes giras de campo asignadas."
						},
						style = MaterialTheme.typography.bodyMedium,
						color = MaterialTheme.colorScheme.onSurfaceVariant
					)
				}
			} else {
				LazyColumn(
					verticalArrangement = Arrangement.spacedBy(16.dp),
					modifier = Modifier.fillMaxSize(),
					contentPadding = PaddingValues(bottom = 16.dp)
				) {
					items(currentList, key = { it.field_trip_id }) { fieldTrip ->
						FieldTripCardItem(
							fieldTrip = fieldTrip,
							onView = { onViewDetails(fieldTrip) }
						)
					}
				}
			}
		}
	}
}