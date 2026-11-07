package ucr.ac.cr.inii.geoterra.data.model.responses

import kotlinx.serialization.Serializable

@Serializable
data class PaginatedFieldTripsRemote(
	val data: List<FieldTripResponse>,
	val pagination: PaginationResponse
)

@Serializable
data class FieldTripResponse(
	val field_trip_id: String,
	val field_trip_name: String,
	val field_trip_start_date: String,
	val field_trip_finish_date: String,
	val field_trip_is_active: Boolean,
	val geomanifestations: List<GeomanifestationResponse> = emptyList(),
	val participants: List<UserResponse> = emptyList(),
	val location: LocationResponse,
	val creator: UserResponse,
	val created_at: String
)