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
import ucr.ac.cr.inii.geoterra.data.model.requests.FieldTripRequest
import ucr.ac.cr.inii.geoterra.data.model.responses.FieldTripResponse
import ucr.ac.cr.inii.geoterra.data.model.responses.MetaResponse
import ucr.ac.cr.inii.geoterra.data.model.responses.PaginatedFieldTripsRemote
import ucr.ac.cr.inii.geoterra.domain.repository.FieldTripRepositoryInterface

class FieldTripRepository(private val client: HttpClient) : FieldTripRepositoryInterface {

	override suspend fun createFieldTrip(request: FieldTripRequest): Result<FieldTripResponse> {
		return try {
			val response = client.post("admin/field-trips") {
				contentType(ContentType.Application.Json)
				setBody(request)
			}

			if (response.status.isSuccess()) {
				val envelope = response.body<ApiResponseModel<FieldTripResponse, MetaResponse>>()

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

	override suspend fun getFieldTrips(page: Int?, limit: Int?): Result<PaginatedFieldTripsRemote> {
		return try {
			val response = client.get("admin/field-trips") {
				page?.let { parameter("page", it) }
				limit?.let { parameter("limit", it) }
			}

			if (response.status.isSuccess()) {
				val envelope = response.body<ApiResponseModel<List<FieldTripResponse>, MetaResponse>>()

				if (envelope.errors.isNotEmpty()) {
					return Result.failure(ApiException(envelope.errors.first()))
				}

				val dataList = envelope.data ?: emptyList()
				val pagination = envelope.meta?.pagination
					?: throw Exception("No se encontró metadata de paginación en el campo 'meta'.")

				Result.success(PaginatedFieldTripsRemote(data = dataList, pagination = pagination))
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

	override suspend fun getFieldTripById(id: String): Result<FieldTripResponse> {
		return try {
			val response = client.get("admin/field-trips/$id")
			if (response.status.isSuccess()) {
				val envelope = response.body<ApiResponseModel<FieldTripResponse, MetaResponse>>()

				if (envelope.errors.isNotEmpty()) {
					return Result.failure(ApiException(envelope.errors.first()))
				}

				Result.success(envelope.data ?: throw Exception("Field trip not found."))
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

	override suspend fun getMyFieldTrips(page: Int?, limit: Int?): Result<PaginatedFieldTripsRemote> {
		return try {
			val response = client.get("admin/field-trips/my") {
				page?.let { parameter("page", it) }
				limit?.let { parameter("limit", it) }
			}

			if (response.status.isSuccess()) {
				val envelope = response.body<ApiResponseModel<List<FieldTripResponse>, MetaResponse>>()

				if (envelope.errors.isNotEmpty()) {
					return Result.failure(ApiException(envelope.errors.first()))
				}

				val dataList = envelope.data ?: emptyList()
				val pagination = envelope.meta?.pagination
					?: throw Exception("No se encontró metadata de paginación en el campo 'meta'.")

				Result.success(PaginatedFieldTripsRemote(data = dataList, pagination = pagination))
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

	override suspend fun updateFieldTrip(
		id: String,
		request: FieldTripRequest
	): Result<FieldTripResponse> {
		return try {
			val response = client.put("admin/field-trips/$id") {
				contentType(ContentType.Application.Json)
				setBody(request)
			}

			if (response.status.isSuccess()) {
				val envelope = response.body<ApiResponseModel<FieldTripResponse, MetaResponse>>()

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

	override suspend fun deleteFieldTrip(id: String): Result<Unit> {
		return try {
			val response = client.delete("admin/field-trips/$id")
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

	override suspend fun addGeomanifestationToFieldTrip(
		id: String,
		geomanifestationId: String
	): Result<FieldTripResponse> {
		return try {
			val response = client.post("admin/field-trips/$id/geomanifestations") {
				contentType(ContentType.Application.Json)
				setBody("geomanifestation_id" to geomanifestationId)
			}
			if (response.status.isSuccess()) {
				val envelope = response.body<ApiResponseModel<FieldTripResponse, MetaResponse>>()

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

	override suspend fun removeGeomanifestationFromFieldTrip(
		id: String,
		geomanifestationId: String
	): Result<FieldTripResponse> {
		return try {
			val response = client.delete("admin/field-trips/$id/geomanifestations")
			if (response.status.isSuccess()) {
				val envelope = response.body<ApiResponseModel<FieldTripResponse, MetaResponse>>()

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
}