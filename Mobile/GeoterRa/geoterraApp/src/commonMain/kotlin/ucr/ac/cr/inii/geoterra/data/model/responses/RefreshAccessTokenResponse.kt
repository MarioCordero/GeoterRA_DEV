package ucr.ac.cr.inii.geoterra.data.model.responses

import kotlinx.serialization.Serializable

@Serializable
data class RefreshAccessTokenResponse(
	val access_token: String,
	val access_expires_at: String,
	val refresh_token: String,
	val refresh_expires_at: String
)