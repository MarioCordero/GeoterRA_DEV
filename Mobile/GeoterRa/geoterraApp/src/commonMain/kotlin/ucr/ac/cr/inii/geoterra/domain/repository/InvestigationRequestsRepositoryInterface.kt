package ucr.ac.cr.inii.geoterra.domain.repository

import ucr.ac.cr.inii.geoterra.data.model.requests.InvestigationRequestRequest
import ucr.ac.cr.inii.geoterra.data.model.responses.InvestigationRequestResponse
import ucr.ac.cr.inii.geoterra.data.model.responses.PaginatedInvestigationRequestsRemote

interface InvestigationRequestsRepositoryInterface {
  suspend fun getMyRequests(page: Int? = null, limit: Int? = null): Result<PaginatedInvestigationRequestsRemote>
	suspend fun getRequestStatuses(id: String): Result<List<InvestigationRequestResponse.StateResponse>>
  suspend fun createRequest(form: InvestigationRequestRequest): Result<Unit>
  suspend fun updateRequest(id: String, form: InvestigationRequestRequest): Result<Unit>
  suspend fun deleteRequest(id: String): Result<Unit>
}