package ucr.ac.cr.inii.geoterra.data.source.remote

import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.request.header
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.http.HttpHeaders
import ucr.ac.cr.inii.geoterra.core.network.ApiEnvelope
import ucr.ac.cr.inii.geoterra.data.model.remote.LoginRequest
import ucr.ac.cr.inii.geoterra.data.model.remote.LoginResponse

class AuthRemoteSource(private val client: HttpClient) {

    suspend fun login(request: LoginRequest): ApiEnvelope<LoginResponse> {
        return client.post("auth/login") {
            setBody(request)
        }.body()
    }

    suspend fun logout(accessToken: String): ApiEnvelope<Map<String, Boolean>> {
        return client.post("auth/logout") {
            header(HttpHeaders.Authorization, "Bearer $accessToken")
        }.body()
    }

    suspend fun refreshToken(token: String): ApiEnvelope<LoginResponse> {
        return client.post("auth/refresh") {
            setBody(mapOf("refresh_token" to token))
        }.body()
    }
}