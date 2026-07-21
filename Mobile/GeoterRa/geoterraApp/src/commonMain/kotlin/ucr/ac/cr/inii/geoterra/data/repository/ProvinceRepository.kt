package ucr.ac.cr.inii.geoterra.data.repository

import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.request.get
import io.ktor.http.isSuccess
import ucr.ac.cr.inii.geoterra.core.network.ApiError
import ucr.ac.cr.inii.geoterra.core.network.ApiException
import ucr.ac.cr.inii.geoterra.core.network.ApiResponseModel
import ucr.ac.cr.inii.geoterra.core.network.handleErrorResponse
import ucr.ac.cr.inii.geoterra.data.model.responses.ProvinceResponse
import ucr.ac.cr.inii.geoterra.domain.repository.ProvinceRepositoryInterface

class ProvinceRepository(private val client: HttpClient) : ProvinceRepositoryInterface {

	override suspend fun getProvinces(): Result<List<ProvinceResponse>> {
		return try {
			val response = client.get("provinces")

			if (response.status.isSuccess()) {
				val envelope = response.body<ApiResponseModel<List<ProvinceResponse>>>()
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
}