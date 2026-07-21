package ucr.ac.cr.inii.geoterra.data.repository

import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.plugins.auth.authProvider
import io.ktor.client.request.*
import io.ktor.client.plugins.auth.providers.*
import io.ktor.client.statement.bodyAsText
import io.ktor.http.ContentType.*
import io.ktor.http.contentType
import io.ktor.http.isSuccess
import ucr.ac.cr.inii.geoterra.core.network.ApiError
import ucr.ac.cr.inii.geoterra.core.network.ApiException
import ucr.ac.cr.inii.geoterra.core.network.ApiResponseModel
import ucr.ac.cr.inii.geoterra.core.network.TokenManager
import ucr.ac.cr.inii.geoterra.core.network.handleErrorResponse
import ucr.ac.cr.inii.geoterra.data.model.requests.LoginRequest
import ucr.ac.cr.inii.geoterra.data.model.responses.LoginResponse
import ucr.ac.cr.inii.geoterra.data.model.requests.RefreshAccessTokenRequest
import ucr.ac.cr.inii.geoterra.data.model.responses.RefreshAccessTokenResponse
import ucr.ac.cr.inii.geoterra.data.model.requests.RegisterRequest
import ucr.ac.cr.inii.geoterra.data.model.responses.RegisterResponse
import ucr.ac.cr.inii.geoterra.domain.repository.AuthRepositoryInterface

class AuthRepository(
	private val client: HttpClient,
	private val tokenManager: TokenManager
) : AuthRepositoryInterface {
	fun invalidateAuthTokens() {

		val authProvider = client.authProvider<BearerAuthProvider>()

		requireNotNull(authProvider)

		authProvider.clearToken()
	}

	override suspend fun register(request: RegisterRequest): Result<Unit> {
		return try {
			val response = client.post("users/register") {
				contentType(Application.Json)
				setBody(request)
			}

			if (!response.status.isSuccess()) {
				val rawBody = response.bodyAsText()

				// Log this for debugging
				println("HTTP ${response.status.value}: $rawBody")
			}

			if (response.status.isSuccess()) {
				val envelope = response.body<ApiResponseModel<RegisterResponse>>()
				if (envelope.data != null) {
					return Result.success(Unit)
				}
			}

			handleErrorResponse(response)
		} catch (e: Exception) {
			Result.failure(
				ApiException(
					ApiError(
						code = ApiError.INTERNAL_ERROR,
						message = "Error de red: verifica tu conexión a internet."
					)
				)
			)
		}
	}

	override suspend fun login(request: LoginRequest): Result<Unit> {
		return try {
			val response = client.post("auth/login") {
				contentType(Application.Json)
				setBody(request)
			}

			if (!response.status.isSuccess()) {
				val rawBody = response.bodyAsText()

				// Log this for debugging
				println("HTTP ${response.status.value}: $rawBody")
			}

			if (response.status.isSuccess()) {
				val envelope = response.body<ApiResponseModel<LoginResponse>>()
				if (envelope.data != null) {
					tokenManager.saveTokens(envelope.data.access_token, envelope.data.refresh_token)
					invalidateAuthTokens()
					return Result.success(Unit)
				}
			}

			handleErrorResponse(response)

		} catch (e: Exception) {
			e.printStackTrace()
			Result.failure(
				ApiException(
					ApiError(
						code = ApiError.INTERNAL_ERROR,
						message = "Error de red: verifica tu conexión a internet."
					)
				)
			)
		}
	}

	override suspend fun logout(): Result<Unit> {
		return try {
			client.post("auth/logout")
			tokenManager.clearTokens()
			invalidateAuthTokens()
			Result.success(Unit)
		} catch (e: Exception) {
			tokenManager.clearTokens()
			invalidateAuthTokens()
			Result.success(Unit)
		}
	}

	override suspend fun refreshAccessToken(): Result<Unit> {

		val refreshToken = tokenManager.getRefreshToken()
			?: return Result.failure(
				ApiException(
					ApiError(
						code = ApiError.INVALID_REFRESH_TOKEN,
						message = "No se encontró el refresh token"
					)
				)
			)

		return try {

			val envelope = client.post("auth/refresh") {
				contentType(Application.Json)
				setBody(RefreshAccessTokenRequest(refreshToken))
			}.body<ApiResponseModel<RefreshAccessTokenResponse>>()

			val data = envelope.data
				?: return Result.failure(
					ApiException(
						ApiError(
							code = ApiError.INVALID_REFRESH_TOKEN,
							message = "Refresh token no contiene datos válidos"
						)
					)
				)
			tokenManager.saveTokens(
				data.access_token,
				data.refresh_token
			)

			Result.success(Unit)

		} catch (e: Exception) {
			tokenManager.clearTokens()
			Result.failure(
				ApiException(
					ApiError(
						code = ApiError.INVALID_REFRESH_TOKEN,
						message = "Session expirada. Inicia sesión nuevamente."
					)
				)
			)
		}
	}

	override suspend fun isUserLoggedIn(): Boolean = tokenManager.getAccessToken() != null
}