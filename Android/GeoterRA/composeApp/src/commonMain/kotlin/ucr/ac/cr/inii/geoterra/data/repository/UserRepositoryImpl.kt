package ucr.ac.cr.inii.geoterra.data.repository

import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.request.delete
import io.ktor.client.request.get
import io.ktor.client.request.put
import io.ktor.client.request.setBody
import ucr.ac.cr.inii.geoterra.core.network.ApiEnvelope
import ucr.ac.cr.inii.geoterra.data.model.remote.MessageResponse
import ucr.ac.cr.inii.geoterra.data.model.remote.UserRemote
import ucr.ac.cr.inii.geoterra.data.model.remote.UserUpdateRequest
import ucr.ac.cr.inii.geoterra.domain.repository.UserRepository

class UserRepositoryImpl(private val client: HttpClient) : UserRepository {
    override suspend fun getMe(): Result<UserRemote> = try {
        val response = client.get("users/me")
        val envelope = response.body<ApiEnvelope<UserRemote>>()
        if (envelope.data != null) Result.success(envelope.data)
        else Result.failure(Exception("User not found"))
    } catch (e: Exception) { Result.failure(e) }

    override suspend fun updateMe(name: String, lastname: String, email: String, phone: String?): Result<String> = try {
        val response = client.put("users/me") {
            setBody(UserUpdateRequest(name, lastname, email, phone))
        }
        val envelope = response.body<ApiEnvelope<MessageResponse>>()
        Result.success(envelope.data?.message ?: "Success")
    } catch (e: Exception) { Result.failure(e) }

    override suspend fun deleteMe(): Result<String> = try {
        val response = client.delete("users/me")
        val envelope = response.body<ApiEnvelope<MessageResponse>>()
        Result.success(envelope.data?.message ?: "Deleted")
    } catch (e: Exception) { Result.failure(e) }
}