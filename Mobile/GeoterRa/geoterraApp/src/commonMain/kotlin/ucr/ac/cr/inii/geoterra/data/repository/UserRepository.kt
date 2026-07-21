package ucr.ac.cr.inii.geoterra.data.repository

import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.request.delete
import io.ktor.client.request.get
import io.ktor.client.request.put
import io.ktor.client.request.setBody
import ucr.ac.cr.inii.geoterra.core.network.ApiError
import ucr.ac.cr.inii.geoterra.core.network.ApiException
import ucr.ac.cr.inii.geoterra.core.network.ApiResponseModel
import ucr.ac.cr.inii.geoterra.core.network.handleErrorResponse
import ucr.ac.cr.inii.geoterra.data.model.responses.UpdateUserResponse
import ucr.ac.cr.inii.geoterra.data.model.responses.UserResponse
import ucr.ac.cr.inii.geoterra.data.model.requests.UserUpdateRequest
import ucr.ac.cr.inii.geoterra.domain.repository.UserRepositoryInterface

class UserRepository(private val client: HttpClient) : UserRepositoryInterface {
	override suspend fun getMe(): Result<UserResponse> = try {
		val response = client.get("users/me")
		val envelope = response.body<ApiResponseModel<UserResponse>>()
		if (envelope.data != null) Result.success(envelope.data)
		else handleErrorResponse(response)
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

	override suspend fun updateMe(
		request: UserUpdateRequest
	): Result<String> = try {
		val response = client.put("users/me") {
			setBody(request)
		}
		val envelope = response.body<ApiResponseModel<UpdateUserResponse>>()
		val message = envelope.data?.message

		if (!message.isNullOrEmpty()) {
			Result.success(message)
		} else {
			handleErrorResponse(response)
		}
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

	override suspend fun deleteMe(): Result<String> = try {
		val response = client.delete("users/me")
		val envelope = response.body<ApiResponseModel<UpdateUserResponse>>()
		val message = envelope.data?.message

		if (!message.isNullOrEmpty()) {
			Result.success(message)
		} else {
			handleErrorResponse(response)
		}
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