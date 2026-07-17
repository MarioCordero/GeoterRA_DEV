package ucr.ac.cr.inii.geoterra.core.network

import io.ktor.client.call.body
import io.ktor.client.statement.HttpResponse
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonElement

@Serializable
data class ApiError(
	val code: String,
	val message: String
) {

	fun isAuthError(): Boolean = code in authErrorCodes

	fun isInvalidAccess(): Boolean = code in invalidAccessCodes

	companion object {
		const val INVALID_CREDENTIALS = "INVALID_CREDENTIALS"
		const val INVALID_FIELD = "INVALID_FIELD"
		const val MISSING_FIELD = "MISSING_FIELD"
		const val MISSING_AUTH_TOKEN = "MISSING_AUTH_TOKEN"
		const val INVALID_ACCESS_TOKEN = "INVALID_ACCESS_TOKEN"
		const val INVALID_REFRESH_TOKEN = "INVALID_REFRESH_TOKEN"
		const val EMAIL_ALREADY_IN_USE = "EMAIL_ALREADY_IN_USE"
		const val WEAK_PASSWORD = "WEAK_PASSWORD"
		const val INVALID_EMAIL = "INVALID_EMAIL"
		const val NOT_FOUND = "NOT_FOUND"
		const val INTERNAL_ERROR = "INTERNAL_ERROR"
		const val FORBIDDEN_ACCESS = "FORBIDDEN_ACCESS"
		const val UNAUTHORIZED = "UNAUTHORIZED"

		private const val DEFAULT_MESSAGE = "Ocurrió un error inesperado. Por favor, intenta de nuevo."

		private val invalidAccessCodes = listOf(
			FORBIDDEN_ACCESS,
			UNAUTHORIZED,
			INVALID_ACCESS_TOKEN,
		)

		private val authErrorCodes = listOf(
			MISSING_AUTH_TOKEN,
			INVALID_REFRESH_TOKEN,
			UNAUTHORIZED
		)
	}
}

class ApiException(
	val error: ApiError
) : Exception(error.message)

fun Throwable.asApiException(): ApiException? = this as? ApiException

fun Throwable.isAuthError(): Boolean =
	asApiException()?.error?.isAuthError() ?: false

fun Throwable.isInvalidAccess(): Boolean =
	asApiException()?.error?.isInvalidAccess() ?: false

@Serializable
data class ApiResponseModel<T>(
	val data: T? = null,
	val meta: Map<String, JsonElement>? = null,
	val errors: List<ApiError> = emptyList()
)

suspend fun <T> handleErrorResponse(response: HttpResponse): Result<T> {
	return try {
		val errorEnvelope = response.body<ApiResponseModel<Unit>>()
		val firstError = errorEnvelope.errors.firstOrNull()

		val errorCode = firstError?.code ?: ApiError.INTERNAL_ERROR
		val errorMessage = firstError?.message
			?: "Ocurrió un error inesperado. Por favor, intenta de nuevo."

		val apiError = ApiError(errorCode, errorMessage)
		Result.failure(ApiException(apiError))
	} catch (e: Exception) {
		val fallbackError = ApiError(ApiError.INTERNAL_ERROR, "Error inesperado en el servidor")
		Result.failure(ApiException(fallbackError))
	}
}