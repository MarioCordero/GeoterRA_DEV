package ucr.ac.cr.inii.geoterra.data.model.responses
import kotlinx.serialization.Serializable

@Serializable
data class LocationResponse(
	val province: String,
	val province_snit_code: Int,
	val canton: String,
	val canton_snit_code: Int,
	val district: String,
	val district_snit_code: Int,
	val latitude: Double,
	val longitude: Double
) {}