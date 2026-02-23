package ucr.ac.cr.inii.geoterra.core.network

import io.ktor.client.call.body
import io.ktor.client.statement.HttpResponse
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonElement

@Serializable
data class ApiError(
  val code: String,
  val message: String
)

@Serializable
data class ApiResponseModel<T>(
  val data: T? = null,
  val meta: Map<String, JsonElement>? = null,
  val errors: List<ApiError> = emptyList()
)

suspend fun <T> handleErrorResponse(response: HttpResponse): Result<T> {
  return try {
    val errorEnvelope = response.body<ApiResponseModel<Unit>>()
    val errorCode = errorEnvelope.errors.firstOrNull()?.code ?: "INTERNAL_ERROR"
    Result.failure(Exception(ErrorMapper.mapCodeToMessage(errorCode)))
  } catch (e: Exception) {
    Result.failure(Exception("Error inesperado en el servidor"))
  }
}