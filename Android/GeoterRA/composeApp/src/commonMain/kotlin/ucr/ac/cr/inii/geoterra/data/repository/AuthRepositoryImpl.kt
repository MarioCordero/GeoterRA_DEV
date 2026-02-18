package ucr.ac.cr.inii.geoterra.data.repository

import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.plugins.auth.authProvider
import io.ktor.client.request.*
import io.ktor.client.plugins.auth.providers.*
import io.ktor.client.statement.bodyAsText
import io.ktor.http.ContentType
import io.ktor.http.ContentType.*
import io.ktor.http.contentType
import io.ktor.http.isSuccess
import ucr.ac.cr.inii.geoterra.core.network.ApiEnvelope
import ucr.ac.cr.inii.geoterra.core.network.ErrorMapper
import ucr.ac.cr.inii.geoterra.core.network.TokenManager
import ucr.ac.cr.inii.geoterra.data.model.remote.LoginRequest
import ucr.ac.cr.inii.geoterra.data.model.remote.LoginResponse
import ucr.ac.cr.inii.geoterra.data.model.remote.RefreshAccessTokenRequest
import ucr.ac.cr.inii.geoterra.data.model.remote.RefreshAccessTokenResponse
import ucr.ac.cr.inii.geoterra.domain.repository.AuthRepository

class AuthRepositoryImpl(
    private val client: HttpClient,
    private val tokenManager: TokenManager
) : AuthRepository {

    fun invalidateAuthTokens() {

        val authProvider = client.authProvider<BearerAuthProvider>()

        requireNotNull(authProvider)

        authProvider.clearToken()
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
                val envelope = response.body<ApiEnvelope<LoginResponse>>()
                if (envelope.data != null) {
                    tokenManager.saveTokens(envelope.data.access_token, envelope.data.refresh_token)
                    invalidateAuthTokens()
                    return Result.success(Unit)
                }
            }

            val errorEnvelope = response.body<ApiEnvelope<LoginResponse>>()
            val firstError = errorEnvelope.errors.firstOrNull()
            val friendlyMessage = firstError?.let { ErrorMapper.mapCodeToMessage(it.code) }
                ?: "Error inesperado (${response.status.value})"

            Result.failure(Exception(friendlyMessage))

        } catch (e: Exception) {
            e.printStackTrace()
            // Handle network exceptions (No internet, timeout, etc.)
            Result.failure(Exception("Error de red: verifica tu conexión."))
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
            ?: return Result.failure(Exception("No refresh token found"))

        return try {

            val envelope = client.post("auth/refresh") {
                contentType(ContentType.Application.Json)
                setBody(RefreshAccessTokenRequest(refreshToken))
            }.body<ApiEnvelope<RefreshAccessTokenResponse>>()

            val data = envelope.data
                ?: return Result.failure(Exception("Refresh failed: empty data"))
            println("Refresh response: $data")

            tokenManager.saveTokens(
                data.access_token,
                data.refresh_token
            )

            Result.success(Unit)

        } catch (e: Exception) {
            tokenManager.clearTokens()
            Result.failure(Exception("Session expired. Please login again."))
        }
    }


    override suspend fun isUserLoggedIn(): Boolean = tokenManager.getAccessToken() != null
}