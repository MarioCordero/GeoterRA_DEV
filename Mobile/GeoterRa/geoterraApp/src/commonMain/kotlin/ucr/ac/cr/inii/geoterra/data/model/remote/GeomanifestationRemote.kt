package ucr.ac.cr.inii.geoterra.data.model.remote

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

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
	val tempMax: Double? = null,
	val showAll: Boolean? = null
)

/**
 * Wrapper for the paginated response containing the list of manifestations and metadata.
 */
@Serializable
data class PaginatedManifestationsRemote(
	val data: List<GeomanifestationRemote>, val pagination: PaginationRemote
)

@Serializable
data class GeomanifestationRemote(
	val geomanifestation_id: String,
	val name: String,
	val latitude: Double,
	val longitude: Double,
	val description: String?,
	val created_at: String,
	val location: LocationRemote,
	val current_georeport: GeoreportRemote? = null,
	val insitu_test: InsituTestRemote? = null,
	val inlab_test: InlabTestRemote? = null
) {

}

fun List<GeomanifestationRemote>.toGeoJsonString(): String {
	val featuresJson = joinToString(",") { manifestation ->
		val temperature = manifestation.insitu_test?.temperature
		"""
        {
          "type": "Feature",
          "geometry": {
            "type": "Point",
            "coordinates": [${manifestation.longitude}, ${manifestation.latitude}]
          },
          "properties": {
            "id": "${manifestation.geomanifestation_id}",
            "name": "${manifestation.name}",
            "description": "${manifestation.description}",
            "temp": $temperature,
						"latitude": ${manifestation.latitude},
			    	"longitude": ${manifestation.longitude},
					  "province": "${manifestation.location.province}",
						"province_snit_code": ${manifestation.location.province_snit_code},
						"canton": "${manifestation.location.canton}",
						"canton_snit_code": ${manifestation.location.canton_snit_code},
					  "district": "${manifestation.location.district}",
						"district_snit_code": ${manifestation.location.district_snit_code}
          }
        }
        """.trimIndent()
	}

	return """
    {
      "type": "FeatureCollection",
      "features": [$featuresJson]
    }
    """.trimIndent()
}