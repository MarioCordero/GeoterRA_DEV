package ucr.ac.cr.inii.geoterra.data.repository

import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.request.*
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
import ucr.ac.cr.inii.geoterra.domain.repository.AuthRepository

class AuthRepositoryImpl(
    private val client: HttpClient,
    private val tokenManager: TokenManager
) : AuthRepository {

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

            val envelope = response.body<ApiEnvelope<LoginResponse>>()

            if (envelope.errors.isEmpty() && envelope.data != null) {
                tokenManager.saveTokens(
                    envelope.data.access_token,
                    envelope.data.refresh_token
                )
                Result.success(Unit)
            } else {
                // Map the first error code to a friendly message
                val firstError = envelope.errors.firstOrNull()
                val friendlyMessage = firstError?.let { ErrorMapper.mapCodeToMessage(it.code) }
                    ?: "Unknown error occurred"
                Result.failure(Exception(friendlyMessage))
            }
        } catch (e: Exception) {
            e.printStackTrace()
            // Handle network exceptions (No internet, timeout, etc.)
            Result.failure(Exception("Network error: Please check your connection."))
        }
    }

    override suspend fun logout(): Result<Unit> {
        return try {
            client.post("auth/logout")
            tokenManager.clearTokens()
            Result.success(Unit)
        } catch (e: Exception) {
            tokenManager.clearTokens() // Always clear tokens locally
            Result.success(Unit)
        }
    }

    override fun isUserLoggedIn(): Boolean = tokenManager.getAccessToken() != null
}