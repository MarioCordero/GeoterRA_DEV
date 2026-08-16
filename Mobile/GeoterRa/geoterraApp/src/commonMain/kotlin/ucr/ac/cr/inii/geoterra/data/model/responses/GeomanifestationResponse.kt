package ucr.ac.cr.inii.geoterra.data.model.responses

import cafe.adriel.voyager.core.lifecycle.JavaSerializable
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.add
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import kotlinx.serialization.json.putJsonArray
import kotlinx.serialization.json.putJsonObject

/**
 * Data class representing the available filters for querying geothermal manifestations.
 * Maps directly to the backend query parameters.
 */
data class GeomanifestationFilters(
	val page: Int? = null,
	val limit: Int? = null,
	val provinceSnitCode: Int? = null,
	val cantonSnitCode: Int? = null,
	val districtSnitCode: Int? = null,
	val tempMin: Double? = null,
	val tempMax: Double? = null
)

/**
 * Wrapper for the paginated response containing the list of manifestations and metadata.
 */
@Serializable
data class PaginatedManifestationsRemote(
	val data: List<GeomanifestationResponse>, val pagination: PaginationResponse
)

@Serializable
data class GeomanifestationResponse(
	val geomanifestation_id: String,
	val geomanifestation_name: String,
	val description: String?,
	val created_at: String,
	val location: LocationResponse,
	val current_georeport: GeoreportResponse? = null,
	val insitu_test: InsituTestResponse? = null,
	val inlab_test: InlabTestResponse? = null
) : JavaSerializable {

}

fun List<GeomanifestationResponse>.toGeoJsonString(): String {
	val featureCollection = buildJsonObject {
		put("type", "FeatureCollection")
		putJsonArray("features") {
			this@toGeoJsonString.forEach { manifestation ->
				add(buildJsonObject {
					put("type", "Feature")

					putJsonObject("geometry") {
						put("type", "Point")
						putJsonArray("coordinates") {
							add(manifestation.location.longitude)
							add(manifestation.location.latitude)
						}
					}

					putJsonObject("properties") {
						put("id", manifestation.geomanifestation_id)
						put("name", manifestation.geomanifestation_name)
						put("description", manifestation.description)
						put("temp", manifestation.insitu_test?.temperature)
						put("latitude", manifestation.location.latitude)
						put("longitude", manifestation.location.longitude)
						put("province", manifestation.location.province)
						put("province_snit_code", manifestation.location.province_snit_code)
						put("canton", manifestation.location.canton)
						put("canton_snit_code", manifestation.location.canton_snit_code)
						put("district", manifestation.location.district)
						put("district_snit_code", manifestation.location.district_snit_code)
					}
				})
			}
		}
	}
	return featureCollection.toString()
}