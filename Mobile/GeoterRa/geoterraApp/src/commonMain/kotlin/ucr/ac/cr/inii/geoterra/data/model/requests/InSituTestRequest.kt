package ucr.ac.cr.inii.geoterra.data.model.requests

import kotlinx.serialization.Serializable
import ucr.ac.cr.inii.geoterra.data.model.responses.InSituTestResponse

@Serializable
data class InSituTestRequest(
	val geomanifestation_id: String? = null,
	val insitu_test_name: String? = null,
	val temperature: Double? = null,
	val conductivity: Double? = null,
	val ph: Double? = null,
	val description: String? = null
) {
	companion object {
		fun fromRemote(response: InSituTestResponse): InSituTestRequest {
			return InSituTestRequest(
				geomanifestation_id = response.geomanifestation_id,
				insitu_test_name = response.insitu_test_name,
				temperature = response.temperature,
				conductivity = response.conductivity,
				ph = response.ph,
				description = response.description
			)
		}
	}
}