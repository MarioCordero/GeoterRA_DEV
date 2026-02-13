package ucr.ac.cr.inii.geoterra.core.network

import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonElement

@Serializable
data class ApiError(
    val code: String,
    val message: String
)

@Serializable
data class ApiEnvelope<T>(
    val data: T? = null,
    val meta: Map<String, JsonElement>? = null,
    val errors: List<ApiError> = emptyList()
)