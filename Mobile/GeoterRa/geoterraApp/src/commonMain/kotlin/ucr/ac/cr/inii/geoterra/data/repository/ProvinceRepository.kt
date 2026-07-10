package ucr.ac.cr.inii.geoterra.data.repository

import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.request.get
import io.ktor.http.isSuccess
import ucr.ac.cr.inii.geoterra.core.network.ApiResponseModel
import ucr.ac.cr.inii.geoterra.core.network.handleErrorResponse
import ucr.ac.cr.inii.geoterra.data.model.remote.ProvinceRemote
import ucr.ac.cr.inii.geoterra.domain.repository.ProvinceRepositoryInterface

class ProvinceRepository(private val client: HttpClient) : ProvinceRepositoryInterface {

  override suspend fun getProvinces(): Result<List<ProvinceRemote>> {
    return try {
      val response = client.get("provinces")

      if (response.status.isSuccess()) {
        val envelope = response.body<ApiResponseModel<List<ProvinceRemote>>>()
        Result.success(envelope.data ?: emptyList())
      } else {
        handleErrorResponse(response)
      }
    } catch (e: Exception) {
      Result.failure(Exception("Error de red: verifica tu conexión."))
    }
  }
}