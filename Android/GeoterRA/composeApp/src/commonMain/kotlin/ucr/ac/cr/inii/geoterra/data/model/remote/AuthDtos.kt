package ucr.ac.cr.inii.geoterra.data.model.remote

import kotlinx.serialization.Serializable

@Serializable
data class LoginRequest(
    val email: String,
    val password: String
)

@Serializable
data class LoginResponse(
    val access_token: String,
    val refresh_token: String,
    val access_expires_at: String,
    val refresh_expires_at: String
)

@Serializable
data class RegisterRequest(
    val name: String,
    val lastname: String,
    val email: String,
    val phone_number: String? = null,
    val password: String
)

@Serializable
data class RefreshAccessTokenRequest(val refresh_token: String)

@Serializable
data class RefreshAccessTokenResponse(
    val access_token: String,
//    val access_expires_at: String,
    val refresh_token: String,
//    val refresh_expires_at: String
)