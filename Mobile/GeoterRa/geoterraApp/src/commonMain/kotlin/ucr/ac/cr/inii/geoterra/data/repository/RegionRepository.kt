package ucr.ac.cr.inii.geoterra.data.repository

import io.github.ismoy.imagepickerkmp.features.ocr.data.network.KtorInstance.client
import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.request.get
import io.ktor.http.isSuccess
import ucr.ac.cr.inii.geoterra.core.network.ApiResponseModel
import ucr.ac.cr.inii.geoterra.core.network.handleErrorResponse
import ucr.ac.cr.inii.geoterra.data.model.remote.RegionRemote
import ucr.ac.cr.inii.geoterra.data.model.remote.UserRemote
import ucr.ac.cr.inii.geoterra.domain.repository.RegionRepositoryInterface

class RegionRepository(private val client: HttpClient) : RegionRepositoryInterface {
  override suspend fun getRegions(): Result<List<RegionRemote>>{
    return try {
      val response = client.get("regions")
      if (response.status.isSuccess()) {
        val envelope = response.body<ApiResponseModel<List<RegionRemote>>>()
        Result.success(envelope.data ?: emptyList())
      } else {
        handleErrorResponse(response)
      }
      return Result.success(emptyList())
    } catch (e: Exception) {
      Result.failure(Exception("Error de red: verifica tu conexión."))
    }
  }
}