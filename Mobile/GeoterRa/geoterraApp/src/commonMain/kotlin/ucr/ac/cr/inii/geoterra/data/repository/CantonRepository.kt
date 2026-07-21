package ucr.ac.cr.inii.geoterra.data.repository

import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.request.get
import io.ktor.http.isSuccess
import ucr.ac.cr.inii.geoterra.core.network.ApiResponseModel
import ucr.ac.cr.inii.geoterra.core.network.handleErrorResponse
import ucr.ac.cr.inii.geoterra.data.model.responses.CantonResponse
import ucr.ac.cr.inii.geoterra.domain.repository.CantonRepositoryInterface

class CantonRepository(private val client: HttpClient) : CantonRepositoryInterface {

  override suspend fun getCantons(): Result<List<CantonResponse>> {
    return try {
      val response = client.get("cantons")

      if (response.status.isSuccess()) {
        val envelope = response.body<ApiResponseModel<List<CantonResponse>>>()
        Result.success(envelope.data ?: emptyList())
      } else {
        handleErrorResponse(response)
      }
    } catch (e: Exception) {
      Result.failure(Exception("Error de red: verifica tu conexión."))
    }
  }
}