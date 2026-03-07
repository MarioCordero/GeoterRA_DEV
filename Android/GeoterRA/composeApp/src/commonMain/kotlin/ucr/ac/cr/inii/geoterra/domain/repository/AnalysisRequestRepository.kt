package ucr.ac.cr.inii.geoterra.domain.repository

import ucr.ac.cr.inii.geoterra.data.model.remote.AnalysisRequestDTO
import ucr.ac.cr.inii.geoterra.data.model.remote.AnalysisRequestRemote

interface AnalysisRequestRepository {
  suspend fun getMyRequests(): Result<List<AnalysisRequestRemote>>
  suspend fun createRequest(form: AnalysisRequestDTO): Result<Unit>
  suspend fun updateRequest(id: String, form: AnalysisRequestDTO): Result<Unit>
  suspend fun deleteRequest(id: String): Result<Unit>
}