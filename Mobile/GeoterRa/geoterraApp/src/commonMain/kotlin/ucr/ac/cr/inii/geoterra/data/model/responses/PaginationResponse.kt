package ucr.ac.cr.inii.geoterra.data.model.responses

import kotlinx.serialization.Serializable

/**
 * Remote representation of the pagination metadata returned by the backend.
 */
@Serializable
data class PaginationResponse(
	val current_page: Int,
	val per_page: Int,
	val total: Int,
	val last_page: Int
)