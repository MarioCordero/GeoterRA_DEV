package ucr.ac.cr.inii.geoterra.data.model.responses

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
	val name: String,
	val description: String?,
	val created_at: String,
	val location: LocationResponse,
	val current_georeport: GeoreportResponse? = null,
	val insitu_test: InsituTestResponse? = null,
	val inlab_test: InlabTestResponse? = null
) {

}

fun List<GeomanifestationResponse>.toGeoJsonString(): String {
	val featuresJson = joinToString(",") { manifestation ->
		val temperature = manifestation.insitu_test?.temperature
		"""
        {
          "type": "Feature",
          "geometry": {
            "type": "Point",
            "coordinates": [${manifestation.location.longitude}, ${manifestation.location.latitude}]
          },
          "properties": {
            "id": "${manifestation.geomanifestation_id}",
            "name": "${manifestation.name}",
            "description": "${manifestation.description}",
            "temp": $temperature,
						"latitude": ${manifestation.location.latitude},
			    	"longitude": ${manifestation.location.longitude},
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