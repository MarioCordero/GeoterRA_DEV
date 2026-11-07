package ucr.ac.cr.inii.geoterra.data.model.responses

import cafe.adriel.voyager.core.lifecycle.JavaSerializable
import kotlinx.serialization.Serializable

data class InSituTestFilters(
	val geomanifestationId: String,
	val insituTestName: String? = null,
	val page: Int? = null,
	val limit: Int? = null
)

@Serializable
data class PaginatedInSituTestsRemote(
	val data: List<InSituTestResponse>,
	val pagination: PaginationResponse
)

@Serializable
data class InSituTestResponse(
	val insitu_test_id: String,
	val geomanifestation_id: String,
	val insitu_test_name: String?,
	val temperature: Double?,
	val conductivity: Double?,
	val ph: Double?,
	val description: String?,
	val visibility: Boolean,
	val created_at: String,
	val created_by_first_name: String?,
	val created_by_last_name: String?
) : JavaSerializable