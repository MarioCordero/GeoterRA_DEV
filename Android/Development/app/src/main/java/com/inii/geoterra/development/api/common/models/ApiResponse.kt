package com.inii.geoterra.development.api.common.models

import android.os.Parcelable
import com.google.gson.annotations.SerializedName
import kotlinx.parcelize.Parcelize

/**
 * Represents a standardized API error response
 * @property type Category or source of the error
 * @property message Human-readable error description
 */
@Parcelize
data class ApiError(
    @SerializedName("type") val type: String = "",
    @SerializedName("message") val message: String = ""
) : Parcelable

/**
 * Base interface for all API responses
 */
interface ApiResponse {
    val response: String
    val errors: List<ApiError>
}