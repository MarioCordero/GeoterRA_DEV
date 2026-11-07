package ucr.ac.cr.inii.geoterra.domain.repository

import ucr.ac.cr.inii.geoterra.data.model.requests.InSituTestRequest
import ucr.ac.cr.inii.geoterra.data.model.responses.InSituTestFilters
import ucr.ac.cr.inii.geoterra.data.model.responses.InSituTestResponse
import ucr.ac.cr.inii.geoterra.data.model.responses.PaginatedInSituTestsRemote

interface InSituTestRepositoryInterface {
	suspend fun getInsituTests(filters: InSituTestFilters): Result<PaginatedInSituTestsRemote>

	suspend fun getInsituTestById(id: String): Result<InSituTestResponse>

	suspend fun createInsituTest(request: InSituTestRequest): Result<InSituTestResponse>

	suspend fun updateInsituTest(id: String, request: InSituTestRequest): Result<InSituTestResponse>

	suspend fun deleteInsituTest(id: String): Result<Unit>
}