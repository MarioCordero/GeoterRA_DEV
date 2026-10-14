package ucr.ac.cr.inii.geoterra.data.model.responses

import kotlinx.serialization.Serializable

@Serializable
data class UserResponse(
	val user_id: String,
	val first_name: String,
	val last_name: String,
	val email: String? = null,
	val phone_number: String? = null,
	val role: String? = null,
	val created_at: String? = null,
	val joined_at: String? = null
)