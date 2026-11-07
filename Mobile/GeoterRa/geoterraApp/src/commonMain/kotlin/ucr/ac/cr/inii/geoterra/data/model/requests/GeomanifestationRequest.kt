package ucr.ac.cr.inii.geoterra.data.model.requests

data class GeomanifestationRequest(
	val geomanifestation_name: String,
	val description: String,
	val province_snit_code: Int,
	val canton_snit_code: Int,
	val district_snit_code: Int,
	val latitude: Double,
	val longitude: Double,
	val visibility: Boolean = false,
	val field_trip_id: String? = null,
	val request_id: String? = null
)