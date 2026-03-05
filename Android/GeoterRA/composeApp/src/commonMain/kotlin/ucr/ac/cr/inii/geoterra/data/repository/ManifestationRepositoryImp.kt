package ucr.ac.cr.inii.geoterra.data.repository

import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.request.get
import io.ktor.http.isSuccess
import ucr.ac.cr.inii.geoterra.core.network.ApiResponseModel
import ucr.ac.cr.inii.geoterra.core.network.handleErrorResponse
import ucr.ac.cr.inii.geoterra.data.model.remote.ManifestationRemote
import ucr.ac.cr.inii.geoterra.domain.repository.ManifestationsRepository

class ManifestationRepositoryImp(private val client: HttpClient) : ManifestationsRepository {
  override suspend fun getManifestations(region_id : UInt): Result<List<ManifestationRemote>> {

    return try {
      val response = client.get("registered-manifestations?region=$region_id")
      if (response.status.isSuccess()) {
        val envelope = response.body<ApiResponseModel<List<ManifestationRemote>>>()
        Result.success(envelope.data ?: emptyList())
      } else {
        handleErrorResponse(response)
      }
    } catch (e: Exception) {
      Result.failure(Exception("Error de conexión: ${e.message}"))
    }
  }
  
}