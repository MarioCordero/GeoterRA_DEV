package ucr.ac.cr.inii.geoterra.data.model.requests
import kotlinx.serialization.Serializable

@Serializable
data class RefreshAccessTokenRequest(val refresh_token: String)