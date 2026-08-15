package ucr.ac.cr.inii.geoterra.data.repository

import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.request.get
import io.ktor.client.request.parameter
import io.ktor.http.isSuccess
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.decodeFromJsonElement
import ucr.ac.cr.inii.geoterra.core.network.ApiError
import ucr.ac.cr.inii.geoterra.core.network.ApiException
import ucr.ac.cr.inii.geoterra.core.network.ApiResponseModel
import ucr.ac.cr.inii.geoterra.core.network.handleErrorResponse
import ucr.ac.cr.inii.geoterra.data.model.responses.GeomanifestationFilters
import ucr.ac.cr.inii.geoterra.data.model.responses.GeomanifestationResponse
import ucr.ac.cr.inii.geoterra.data.model.responses.PaginatedManifestationsRemote
import ucr.ac.cr.inii.geoterra.data.model.responses.PaginationResponse
import ucr.ac.cr.inii.geoterra.domain.repository.GeomanifestationsRepositoryInterface
import kotlin.collections.emptyMap

/**
 * Repository implementation for managing geothermal manifestation data operations via network.
 */
class GeomanifestationsRepository(private val client: HttpClient) :
	GeomanifestationsRepositoryInterface {

	private val json = Json { ignoreUnknownKeys = true }

	/**
	 * Retrieves a paginated and filtered list of geothermal manifestations.
	 * Appends dynamic parameters based on the provided [filters].
	 */
	override suspend fun getManifestations(filters: GeomanifestationFilters): Result<PaginatedManifestationsRemote> {
		return try {
			val response = client.get("geomanifestations") {
				filters.page?.let { parameter("page", it) }
				filters.limit?.let { parameter("limit", it) }
				filters.provinceSnitCode?.let { parameter("province_snit_code", it) }
				filters.cantonSnitCode?.let { parameter("canton_snit_code", it) }
				filters.districtSnitCode?.let { parameter("district_snit_code", it) }
				filters.tempMin?.let { parameter("temp_min", it) }
				filters.tempMax?.let { parameter("temp_max", it) }
			}

			if (response.status.isSuccess()) {
				val envelope = response.body<ApiResponseModel<List<GeomanifestationResponse>, JsonElement>>()

				val dataList = envelope.data ?: throw Exception("Empty data received.")

				val metaMap = envelope.meta

				val paginationJsonElement = metaMap["pagination"] ?: JsonObject(metaMap)

				val pagination = json.decodeFromJsonElement<PaginationResponse>(
					paginationJsonElement
				)

				val paginatedManifestationsRemote = PaginatedManifestationsRemote(
					data = dataList,
					pagination = pagination
				)
				Result.success(paginatedManifestationsRemote)
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

	/**
	 * Retrieves detailed information of a single geothermal manifestation by its unique [id].
	 */
	override suspend fun getManifestationById(id: String): Result<GeomanifestationResponse> {
		return try {
			val response = client.get("geomanifestations/$id")

			if (response.status.isSuccess()) {
				val envelope = response.body<ApiResponseModel<GeomanifestationResponse>>()
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