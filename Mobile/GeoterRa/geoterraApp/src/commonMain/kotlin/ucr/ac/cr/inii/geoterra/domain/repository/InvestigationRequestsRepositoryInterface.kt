package ucr.ac.cr.inii.geoterra.domain.repository

import ucr.ac.cr.inii.geoterra.data.model.responses.InvestigationRequestRequest
import ucr.ac.cr.inii.geoterra.data.model.responses.InvestigationRequestResponse

interface InvestigationRequestsRepositoryInterface {
  suspend fun getMyRequests(): Result<List<InvestigationRequestResponse>>
  suspend fun createRequest(form: InvestigationRequestRequest): Result<Unit>
  suspend fun updateRequest(id: String, form: InvestigationRequestRequest): Result<Unit>
  suspend fun deleteRequest(id: String): Result<Unit>
}