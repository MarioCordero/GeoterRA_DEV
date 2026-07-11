package ucr.ac.cr.inii.geoterra.data.model.responses
import kotlinx.serialization.Serializable

@Serializable
data class RegisterResponse(
	val user_id: String
)