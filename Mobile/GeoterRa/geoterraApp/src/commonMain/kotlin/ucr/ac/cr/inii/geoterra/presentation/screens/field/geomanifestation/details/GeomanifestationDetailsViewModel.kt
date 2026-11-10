package ucr.ac.cr.inii.geoterra.presentation.screens.field.geomanifestation.details

import cafe.adriel.voyager.core.model.screenModelScope
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import ucr.ac.cr.inii.geoterra.core.network.ApiException
import ucr.ac.cr.inii.geoterra.data.model.responses.InSituTestFilters
import ucr.ac.cr.inii.geoterra.domain.repository.GeomanifestationsRepositoryInterface
import ucr.ac.cr.inii.geoterra.domain.repository.InSituTestRepositoryInterface
import ucr.ac.cr.inii.geoterra.presentation.base.BaseScreenModel
import ucr.ac.cr.inii.geoterra.presentation.components.common.SnackbarMessage
import ucr.ac.cr.inii.geoterra.presentation.components.common.SnackbarType

class GeomanifestationDetailsViewModel(
	private val geomanifestationId: String,
	private val geomanifestationsRepository: GeomanifestationsRepositoryInterface,
	private val inSituTestRepository: InSituTestRepositoryInterface
) : BaseScreenModel<GeomanifestationDetailsState>(GeomanifestationDetailsState()) {

	init {
		fetchDetails()
	}

	fun fetchDetails() {
		screenModelScope.launch {
			_state.update { it.copy(isLoading = true, snackBarMessage = null) }

			val geoResult = geomanifestationsRepository.getGeomanifestationById(geomanifestationId)
			val testsResult = inSituTestRepository.getInsituTests(
				InSituTestFilters(geomanifestationId = geomanifestationId)
			)

			geoResult
				.onSuccess { data ->
					val tests = testsResult.getOrNull()?.data ?: emptyList()

					_state.update {
						it.copy(
							isLoading = false,
							geomanifestation = data,
							inSituTests = tests
						)
					}
				}
				.onFailure { exception ->
					val apiException = exception as? ApiException
					_state.update {
						it.copy(
							isLoading = false,
							snackBarMessage = SnackbarMessage(
								text = apiException?.message ?: "Error al obtener detalles de la manifestación",
								type = SnackbarType.ERROR
							)
						)
					}
				}
		}
	}

	fun clearSnackBarMessage() {
		_state.update { it.copy(snackBarMessage = null) }
	}
}