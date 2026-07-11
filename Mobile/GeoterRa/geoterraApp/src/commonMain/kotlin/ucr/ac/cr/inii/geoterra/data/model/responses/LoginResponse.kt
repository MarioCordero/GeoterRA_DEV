package ucr.ac.cr.inii.geoterra.data.model.responses

import kotlinx.serialization.Serializable

@Serializable
data class LoginResponse(
	val access_token: String,
	val refresh_token: String
)