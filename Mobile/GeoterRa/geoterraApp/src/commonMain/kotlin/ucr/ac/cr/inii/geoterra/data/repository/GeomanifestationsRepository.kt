package ucr.ac.cr.inii.geoterra.data.repository

import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.request.get
import io.ktor.client.request.parameter
import io.ktor.http.isSuccess
import ucr.ac.cr.inii.geoterra.core.network.ApiResponseModel
import ucr.ac.cr.inii.geoterra.core.network.handleErrorResponse
import ucr.ac.cr.inii.geoterra.data.model.responses.GeomanifestationFilters
import ucr.ac.cr.inii.geoterra.data.model.responses.GeomanifestationResponse
import ucr.ac.cr.inii.geoterra.data.model.responses.PaginatedManifestationsRemote
import ucr.ac.cr.inii.geoterra.domain.repository.GeomanifestationsRepositoryInterface

/**
 * Repository implementation for managing geothermal manifestation data operations via network.
 */
class GeomanifestationsRepository(private val client: HttpClient) : GeomanifestationsRepositoryInterface {

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
        val envelope = response.body<ApiResponseModel<PaginatedManifestationsRemote>>()
        Result.success(envelope.data ?: throw Exception("Empty response body received."))
      } else {
        handleErrorResponse(response)
      }
    } catch (e: Exception) {
      Result.failure(Exception("Error de red: verifica tu conexión."))
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
      Result.failure(Exception("Error de red: verifica tu conexión."))
    }
  }
}