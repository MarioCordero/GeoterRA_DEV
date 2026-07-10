package ucr.ac.cr.inii.geoterra.data.model.remote

import kotlinx.serialization.Serializable

@Serializable
data class GeoreportRemote(
	val georeport_id: String,
	val details: String?,
	val created_at: String
)