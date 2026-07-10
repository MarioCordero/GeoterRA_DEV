package ucr.ac.cr.inii.geoterra.data.model.remote

import kotlinx.serialization.Serializable

/**
 * Remote representation of the pagination metadata returned by the backend.
 */
@Serializable
data class PaginationRemote(
	val current_page: Int,
	val per_page: Int,
	val total: Int,
	val last_page: Int
)