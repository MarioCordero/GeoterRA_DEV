package ucr.ac.cr.inii.geoterra.data.model.responses

import kotlinx.serialization.Serializable

@Serializable
data class GeoreportResponse(
	val georeport_id: String,
	val details: String?,
	val created_at: String
)