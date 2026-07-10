package ucr.ac.cr.inii.geoterra.data.repository

import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.request.get
import io.ktor.http.isSuccess
import ucr.ac.cr.inii.geoterra.core.network.ApiResponseModel
import ucr.ac.cr.inii.geoterra.core.network.handleErrorResponse
import ucr.ac.cr.inii.geoterra.data.model.remote.DistrictRemote
import ucr.ac.cr.inii.geoterra.domain.repository.DistrictRepositoryInterface

class DistrictRepository(private val client: HttpClient) : DistrictRepositoryInterface {

  override suspend fun getDistricts(): Result<List<DistrictRemote>> {
    return try {
      val response = client.get("districts")

      if (response.status.isSuccess()) {
        val envelope = response.body<ApiResponseModel<List<DistrictRemote>>>()
        Result.success(envelope.data ?: emptyList())
      } else {
        handleErrorResponse(response)
      }
    } catch (e: Exception) {
      Result.failure(Exception("Error de red: verifica tu conexión."))
    }
  }
}