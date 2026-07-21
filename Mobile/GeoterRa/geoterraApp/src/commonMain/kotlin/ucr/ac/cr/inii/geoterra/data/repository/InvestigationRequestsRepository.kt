package ucr.ac.cr.inii.geoterra.data.repository

import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.request.*
import io.ktor.http.*
import kotlinx.serialization.json.JsonElement
import ucr.ac.cr.inii.geoterra.core.network.ApiError
import ucr.ac.cr.inii.geoterra.core.network.ApiException
import ucr.ac.cr.inii.geoterra.core.network.ApiResponseModel
import ucr.ac.cr.inii.geoterra.core.network.handleErrorResponse
import ucr.ac.cr.inii.geoterra.data.model.responses.InvestigationRequestRequest
import ucr.ac.cr.inii.geoterra.data.model.responses.InvestigationRequestResponse
import ucr.ac.cr.inii.geoterra.domain.repository.InvestigationRequestsRepositoryInterface

class InvestigationRequestsRepository(
	private val client: HttpClient
) : InvestigationRequestsRepositoryInterface {

	override suspend fun getMyRequests(): Result<List<InvestigationRequestResponse>> {
		return try {
			val response = client.get("analysis-requests")

			if (response.status.isSuccess()) {
				val envelope = response.body<ApiResponseModel<List<InvestigationRequestResponse>>>()

				if (envelope.errors.isNotEmpty()) {
					return Result.failure(ApiException(envelope.errors.first()))
				}

				Result.success(envelope.data ?: emptyList())

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

	override suspend fun createRequest(form: InvestigationRequestRequest): Result<Unit> {
		return try {
			val response = client.post("analysis-requests") {
				contentType(ContentType.Application.Json)
				setBody(form)
			}
			if (response.status.isSuccess()) Result.success(Unit)
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
	}

	override suspend fun updateRequest(id: String, form: InvestigationRequestRequest): Result<Unit> {
		return try {
			val response = client.put("analysis-requests/$id") {
				contentType(ContentType.Application.Json)
				setBody(form)
			}
			if (response.status.isSuccess()) {
				val envelope = response.body<ApiResponseModel<JsonElement>>()

				if (envelope.errors.isNotEmpty()) {
					return Result.failure(ApiException(envelope.errors.first()))
				}
				Result.success(Unit)
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

	override suspend fun deleteRequest(id: String): Result<Unit> {
		return try {
			val response = client.delete("analysis-requests/$id")
			if (response.status.isSuccess()) {
				if (response.status == HttpStatusCode.NoContent) {
					return Result.success(Unit)
				}

				val envelope = response.body<ApiResponseModel<JsonElement>>()

				if (envelope.errors.isNotEmpty()) {
					return Result.failure(ApiException(envelope.errors.first()))
				}

				Result.success(Unit)
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
}