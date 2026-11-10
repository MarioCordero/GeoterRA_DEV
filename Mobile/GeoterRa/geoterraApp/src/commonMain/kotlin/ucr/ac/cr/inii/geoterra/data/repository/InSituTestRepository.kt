package ucr.ac.cr.inii.geoterra.data.repository

import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.request.delete
import io.ktor.client.request.get
import io.ktor.client.request.parameter
import io.ktor.client.request.post
import io.ktor.client.request.put
import io.ktor.client.request.setBody
import io.ktor.http.ContentType
import io.ktor.http.HttpStatusCode
import io.ktor.http.contentType
import io.ktor.http.isSuccess
import kotlinx.serialization.json.JsonElement
import ucr.ac.cr.inii.geoterra.core.network.ApiError
import ucr.ac.cr.inii.geoterra.core.network.ApiException
import ucr.ac.cr.inii.geoterra.core.network.ApiResponseModel
import ucr.ac.cr.inii.geoterra.core.network.handleErrorResponse
import ucr.ac.cr.inii.geoterra.data.model.requests.InSituTestRequest
import ucr.ac.cr.inii.geoterra.data.model.responses.InSituTestFilters
import ucr.ac.cr.inii.geoterra.data.model.responses.InSituTestResponse
import ucr.ac.cr.inii.geoterra.data.model.responses.MetaResponse
import ucr.ac.cr.inii.geoterra.data.model.responses.PaginatedInSituTestsRemote
import ucr.ac.cr.inii.geoterra.domain.repository.InSituTestRepositoryInterface

class InSituTestRepository(private val client: HttpClient) : InSituTestRepositoryInterface {

	override suspend fun getInsituTests(filters: InSituTestFilters): Result<PaginatedInSituTestsRemote> {
		return try {
			val response = client.get("admin/insitu-tests") {
				parameter("geomanifestation_id", filters.geomanifestationId)
				filters.insituTestName?.let { parameter("insitu_test_name", it) }
				filters.page?.let { parameter("page", it) }
				filters.limit?.let { parameter("limit", it) }
			}

			if (response.status.isSuccess()) {
				val envelope = response.body<ApiResponseModel<List<InSituTestResponse>, MetaResponse>>()

				if (envelope.errors.isNotEmpty()) {
					return Result.failure(ApiException(envelope.errors.first()))
				}

				val dataList = envelope.data ?: emptyList()
				val pagination = envelope.meta?.pagination
					?: throw Exception("No se encontró metadata de paginación en el campo 'meta'.")

				Result.success(PaginatedInSituTestsRemote(data = dataList, pagination = pagination))
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

	override suspend fun getInsituTestById(id: String): Result<InSituTestResponse> {
		return try {
			val response = client.get("admin/insitu-tests/$id")
			if (response.status.isSuccess()) {
				val envelope = response.body<ApiResponseModel<InSituTestResponse, MetaResponse>>()

				if (envelope.errors.isNotEmpty()) {
					return Result.failure(ApiException(envelope.errors.first()))
				}

				Result.success(envelope.data ?: throw Exception("In-situ test not found."))
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

	override suspend fun createInsituTest(request: InSituTestRequest): Result<InSituTestResponse> {
		return try {
			val response = client.post("admin/insitu-tests") {
				contentType(ContentType.Application.Json)
				setBody(request)
			}

			if (response.status.isSuccess()) {
				val envelope = response.body<ApiResponseModel<InSituTestResponse, MetaResponse>>()

				if (envelope.errors.isNotEmpty()) {
					return Result.failure(ApiException(envelope.errors.first()))
				}

				Result.success(envelope.data ?: throw Exception("Empty response body received."))
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

	override suspend fun updateInsituTest(
		id: String,
		request: InSituTestRequest
	): Result<InSituTestResponse> {
		return try {
			val response = client.put("admin/insitu-tests/$id") {
				contentType(ContentType.Application.Json)
				setBody(request)
			}

			if (response.status.isSuccess()) {
				val envelope = response.body<ApiResponseModel<InSituTestResponse, MetaResponse>>()

				if (envelope.errors.isNotEmpty()) {
					return Result.failure(ApiException(envelope.errors.first()))
				}

				Result.success(envelope.data ?: throw Exception("Empty response body received."))
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

	override suspend fun deleteInsituTest(id: String): Result<Unit> {
		return try {
			val response = client.delete("admin/insitu-tests/$id")
			if (response.status.isSuccess()) {
				if (response.status == HttpStatusCode.NoContent) {
					return Result.success(Unit)
				}

				val envelope = response.body<ApiResponseModel<JsonElement, MetaResponse>>()

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