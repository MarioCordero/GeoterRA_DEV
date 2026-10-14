package ucr.ac.cr.inii.geoterra.data.repository

import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.request.delete
import io.ktor.client.request.forms.MultiPartFormDataContent
import io.ktor.client.request.forms.formData
import io.ktor.client.request.get
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.http.ContentType
import io.ktor.http.contentType
import io.ktor.http.isSuccess
import ucr.ac.cr.inii.geoterra.core.network.ApiError
import ucr.ac.cr.inii.geoterra.core.network.ApiException
import ucr.ac.cr.inii.geoterra.core.network.ApiResponseModel
import ucr.ac.cr.inii.geoterra.core.network.handleErrorResponse
import ucr.ac.cr.inii.geoterra.data.model.responses.FieldTripResponse
import ucr.ac.cr.inii.geoterra.data.model.responses.GeomanifestationResponse
import ucr.ac.cr.inii.geoterra.data.model.responses.InvestigationRequestResponse
import ucr.ac.cr.inii.geoterra.data.model.responses.MetaResponse
import ucr.ac.cr.inii.geoterra.data.model.responses.UserResponse
import ucr.ac.cr.inii.geoterra.domain.repository.FieldTripRepositoryInterface

class FieldTripRepository(private val client: HttpClient)
	: FieldTripRepositoryInterface {
	override suspend fun getFieldTrips(): Result<List<FieldTripResponse>> {
		return try {
			val response = client.get("field-trips")
			if (response.status.isSuccess()) {
				val envelope = response.body<ApiResponseModel<List<FieldTripResponse>, MetaResponse>>()

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

	override suspend fun getMyFieldTrips(): Result<List<FieldTripResponse>> {
		return try {
			val response = client.get("field-trips/my")
			if (response.status.isSuccess()) {
				val envelope = response.body<ApiResponseModel<List<FieldTripResponse>, MetaResponse>>()

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

	override suspend fun addGeomanifestationToFieldTrip(
		id: String,
		geomanifestationId: String
	): Result<FieldTripResponse> {
		return try {
			val response = client.post("field-trips/$id/geomanifestations") {
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
			val response = client.delete("field-trips/$id/geomanifestations")
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