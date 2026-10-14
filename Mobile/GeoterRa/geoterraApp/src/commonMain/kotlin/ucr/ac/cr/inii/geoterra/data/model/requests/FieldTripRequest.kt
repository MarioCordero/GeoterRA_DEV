package ucr.ac.cr.inii.geoterra.data.model.requests

import kotlinx.serialization.Serializable

@Serializable
data class FieldTripRequest(
	val field_trip_name: String,
	val field_trip_scheduled_date: String,
	val field_trip_start_date: String,
	val field_trip_finish_date: String,
	val field_trip_is_active: Boolean,
	val geomanifestations: List<String>,
	val participants: List<String>,
	val province_snit_code: Int,
	val canton_snit_code: Int,
	val district_snit_code: Int
)