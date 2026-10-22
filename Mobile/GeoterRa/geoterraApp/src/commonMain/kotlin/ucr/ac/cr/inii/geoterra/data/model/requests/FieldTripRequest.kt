package ucr.ac.cr.inii.geoterra.data.model.requests

import kotlinx.serialization.Serializable
import ucr.ac.cr.inii.geoterra.data.model.responses.FieldTripResponse

@Serializable
data class FieldTripRequest(
	val field_trip_name: String = "",
	val field_trip_scheduled_date: String = "",
	val field_trip_start_date: String? = null,
	val field_trip_finish_date: String? = null,
	val field_trip_is_active: Boolean = true,
	val geomanifestations: List<String> = emptyList(),
	val participants: List<String> = emptyList(),
	val province_snit_code: Int = 0,
	val canton_snit_code: Int = 0,
	val district_snit_code: Int = 0
) {
	companion object {
		fun fromRemote(response: FieldTripResponse): FieldTripRequest {
			return FieldTripRequest(
				field_trip_name = response.field_trip_name,
				field_trip_scheduled_date = response.field_trip_scheduled_date,
				field_trip_start_date = response.field_trip_start_date,
				field_trip_finish_date = response.field_trip_finish_date,
				field_trip_is_active = response.field_trip_is_active,
				geomanifestations = response.geomanifestations.map { it.geomanifestation_id },
				participants = response.participants.map { it.user_id },
				province_snit_code = response.location.province_snit_code,
				canton_snit_code = response.location.canton_snit_code,
				district_snit_code = response.location.district_snit_code
			)
		}
	}
}