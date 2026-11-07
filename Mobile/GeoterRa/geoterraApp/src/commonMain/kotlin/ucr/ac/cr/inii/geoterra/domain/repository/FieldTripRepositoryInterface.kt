package ucr.ac.cr.inii.geoterra.domain.repository

import ucr.ac.cr.inii.geoterra.data.model.requests.FieldTripRequest
import ucr.ac.cr.inii.geoterra.data.model.responses.FieldTripResponse
import ucr.ac.cr.inii.geoterra.data.model.responses.PaginatedFieldTripsRemote

interface FieldTripRepositoryInterface {
	suspend fun createFieldTrip(request: FieldTripRequest): Result<FieldTripResponse>
	suspend fun getFieldTrips(page: Int? = null, limit: Int? = null): Result<PaginatedFieldTripsRemote>

	suspend fun getFieldTripById(id: String): Result<FieldTripResponse>

	suspend fun getMyFieldTrips(page: Int? = null, limit: Int? = null): Result<PaginatedFieldTripsRemote>

	suspend fun updateFieldTrip(id: String, request: FieldTripRequest): Result<FieldTripResponse>
	suspend fun deleteFieldTrip(id: String): Result<Unit>

	suspend fun addGeomanifestationToFieldTrip(id: String, geomanifestationId: String): Result<FieldTripResponse>

	suspend fun removeGeomanifestationFromFieldTrip(id: String, geomanifestationId: String): Result<FieldTripResponse>
}