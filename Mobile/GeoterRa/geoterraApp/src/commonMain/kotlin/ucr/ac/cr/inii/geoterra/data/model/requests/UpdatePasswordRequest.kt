package ucr.ac.cr.inii.geoterra.data.model.requests

import kotlinx.serialization.Serializable

@Serializable
data class UpdatePasswordRequest (
	val current_password: String,
	val new_password: String
)