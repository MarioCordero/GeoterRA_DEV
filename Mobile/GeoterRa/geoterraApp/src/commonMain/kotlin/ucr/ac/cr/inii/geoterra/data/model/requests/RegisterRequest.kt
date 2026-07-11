package ucr.ac.cr.inii.geoterra.data.model.requests

import kotlinx.serialization.Serializable

@Serializable
data class RegisterRequest(
	val name: String,
	val lastname: String,
	val email: String,
	val phone_number: String? = null,
	val password: String
)