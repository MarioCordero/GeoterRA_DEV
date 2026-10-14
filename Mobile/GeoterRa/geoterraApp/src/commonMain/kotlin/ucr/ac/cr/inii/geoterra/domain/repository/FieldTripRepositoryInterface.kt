package ucr.ac.cr.inii.geoterra.domain.repository

import ucr.ac.cr.inii.geoterra.data.model.responses.FieldTripResponse

interface FieldTripRepositoryInterface {
	suspend fun getFieldTrips(): Result<List<FieldTripResponse>>

	suspend fun getMyFieldTrips(): Result<List<FieldTripResponse>>

	suspend fun addGeomanifestationToFieldTrip(id: String, geomanifestationId: String): Result<FieldTripResponse>

	suspend fun removeGeomanifestationFromFieldTrip(id: String, geomanifestationId: String): Result<FieldTripResponse>
}