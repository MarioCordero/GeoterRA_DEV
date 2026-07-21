package ucr.ac.cr.inii.geoterra.data.model.responses

import kotlinx.serialization.Serializable

@Serializable
data class DistrictResponse(
	val district_id: String,
	val district_snit_code: Int,
	val district_name: String,
	val created_at: String
)