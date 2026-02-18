package ucr.ac.cr.inii.geoterra.data.repository

import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.request.*
import io.ktor.http.*
import ucr.ac.cr.inii.geoterra.core.network.ApiEnvelope
import ucr.ac.cr.inii.geoterra.core.network.ErrorMapper
import ucr.ac.cr.inii.geoterra.data.model.remote.AnalysisRequestFormRemote
import ucr.ac.cr.inii.geoterra.data.model.remote.AnalysisRequestRemote
import ucr.ac.cr.inii.geoterra.domain.repository.AnalysisRequestRepository

class AnalysisRequestRepositoryImpl(
    private val client: HttpClient
) : AnalysisRequestRepository {

    override suspend fun getMyRequests(): Result<List<AnalysisRequestRemote>> {
        return try {
            val response = client.get("analysis-request")

            if (response.status.isSuccess()) {
                val envelope = response.body<ApiEnvelope<List<AnalysisRequestRemote>>>()
                Result.success(envelope.data ?: emptyList())
            } else {
                handleError(response)
            }
        } catch (e: Exception) {
            Result.failure(Exception("Error de conexión: ${e.message}"))
        }
    }

    override suspend fun createRequest(form: AnalysisRequestFormRemote): Result<Unit> {
        return try {
            val response = client.post("analysis-request") {
                contentType(ContentType.Application.Json)
                setBody(form)
            }
            if (response.status.isSuccess()) Result.success(Unit)
            else handleError(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun updateRequest(id: String, form: AnalysisRequestFormRemote): Result<Unit> {
        return try {
            val response = client.put("analysis-request/$id") {
                contentType(ContentType.Application.Json)
                setBody(form)
            }
            if (response.status.isSuccess()) Result.success(Unit)
            else handleError(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun deleteRequest(id: String): Result<Unit> {
        return try {
            val response = client.delete("analysis-request/$id")
            if (response.status.isSuccess()) Result.success(Unit)
            else handleError(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

        // Helper centralizado para mapear errores usando tu ErrorMapper
    private suspend fun <T> handleError(response: io.ktor.client.statement.HttpResponse): Result<T> {
        return try {
            val errorEnvelope = response.body<ApiEnvelope<Unit>>()
            val errorCode = errorEnvelope.errors.firstOrNull()?.code ?: "INTERNAL_ERROR"
            Result.failure(Exception(ErrorMapper.mapCodeToMessage(errorCode)))
        } catch (e: Exception) {
            Result.failure(Exception("Error inesperado en el servidor"))
        }
    }
}