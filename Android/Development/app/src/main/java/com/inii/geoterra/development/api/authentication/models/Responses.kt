package com.inii.geoterra.development.api.authentication.models

import com.google.gson.annotations.SerializedName
import com.inii.geoterra.development.api.common.models.ApiError
import com.inii.geoterra.development.api.common.models.ApiResponse

/**
 * Authentication response for sign-in operations
 * @property response Operation status (success/error)
 * @property message Optional status message
 * @property errors List of validation errors
 */
data class SignInResponse(
    @SerializedName("response") override val response: String = "",
    @SerializedName("message") val message: String = "",
    @SerializedName("errors") override val errors: List<ApiError> = emptyList()
) : ApiResponse

/**
 * Registration response for new user accounts
 * @property response Operation status (success/error)
 * @property message Optional status message
 * @property errors Map of field-specific validation errors
 */
data class SignUpResponse(
    @SerializedName("response") override val response: String = "",
    @SerializedName("message") val message: String = "",
    @SerializedName("errors") val fieldErrors: Map<String, String>? = null
) : ApiResponse {
    override val errors: List<ApiError>
        get() = fieldErrors?.map { ApiError(it.key, it.value) } ?: emptyList()
}

/**
 * Response containing user profile data
 * @property response Operation status (success/error)
 * @property data Complete user profile information
 * @property errors List of retrieval errors
 */
data class UserProfileResponse(
    @SerializedName("response") override val response: String = "",
    @SerializedName("data") val data: UserProfile = UserProfile(),
    @SerializedName("errors") override val errors: List<ApiError> = emptyList()
) : ApiResponse

/**
 * Response for logout operations
 * @property response Operation status (success/error)
 * @property errors List of operation errors
 */
data class LogoutResponse(
    @SerializedName("response") override val response: String = "",
    @SerializedName("errors") override val errors: List<ApiError> = emptyList()
) : ApiResponse