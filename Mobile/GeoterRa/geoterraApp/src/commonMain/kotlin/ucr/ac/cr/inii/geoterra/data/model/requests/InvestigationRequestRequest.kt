package ucr.ac.cr.inii.geoterra.data.model.requests

import kotlinx.serialization.Serializable
import ucr.ac.cr.inii.geoterra.data.model.responses.InvestigationRequestResponse


@Serializable
data class InvestigationRequestRequest(
	val province_snit_code: Int = 0,
	val canton_snit_code: Int = 0,
	val district_snit_code: Int = 0,
	val owner_name: String? = null,
	val owner_phone_number: String? = null,
	val owner_email: String? = null,
	val current_usage: String = "",
	val temperature_sensation: String = "",
	val bubbles: Boolean = false,
	val details: String = "",
	val exact_address: String = "",
	val latitude: Double = 0.0,
	val longitude: Double = 0.0,
	val relation_with_owner: String = ""
) {
	companion object Companion {
		/**
		 * Maps a remote AnalysisRequest to a DTO.
		 */
		fun fromRemote(remote: InvestigationRequestResponse): InvestigationRequestRequest {
			return InvestigationRequestRequest(
				province_snit_code = remote.location.province_snit_code,
				canton_snit_code = remote.location.canton_snit_code,
				district_snit_code = remote.location.district_snit_code,
				owner_name = remote.owner_name,
				owner_phone_number = remote.owner_phone_number,
				owner_email = remote.owner_email,
				current_usage = remote.current_usage,
				temperature_sensation = remote.temperature_sensation,
				bubbles = remote.bubbles,
				details = remote.details,
				exact_address = remote.exact_address,
				latitude = remote.location.latitude,
				longitude = remote.location.longitude,
				relation_with_owner = remote.relation_with_owner
			)
		}
	}
}