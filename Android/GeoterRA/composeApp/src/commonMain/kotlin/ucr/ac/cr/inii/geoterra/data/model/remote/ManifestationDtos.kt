package ucr.ac.cr.inii.geoterra.data.model.remote


import kotlinx.serialization.Serializable


@Serializable
data class ManifestationRemote(
  val id : String,
  val name : String,
  val region_id : UInt,
  val latitude : Float,
  val longitude : Float,
  val description : String?,
  val temperature : Float?,
  val field_pH : Float?,
  val field_conductivity: Float?,
  val lab_pH : Float?,
  val lab_conductivity : Float?,
  val cl : Float?,
  val ca : Float?,
  val hco3 : Float?,
  val so4 : Float?,
  val fe : Float?,
  val si : Float?,
  val b : Float?,
  val li : Float?,
  val f : Float?,
  val na : Float?,
  val k : Float?,
  val mg : Float?,
  val created_at : String,
  val created_by : String,
  val modified_at : String?,
  val modified_by : String?
) {
  fun regionName(): String {
    return when (region_id) {
      1u -> "San José"
      2u -> "Alajuela"
      3u -> "Cartago"
      4u -> "Heredia"
      5u -> "Guanacaste"
      6u -> "Puntarenas"
      7u -> "Limón"
      else -> "Desconocida"
    }
  }
}

fun List<ManifestationRemote>.toGeoJsonString(): String {
  val featuresJson = this.joinToString(",") { manifestation ->
    """
        {
          "type": "Feature",
          "geometry": {
            "type": "Point",
            "coordinates": [${manifestation.longitude}, ${manifestation.latitude}]
          },
          "properties": {
            "id": "${manifestation.id}",
            "name": "${manifestation.name}",
            "temp": ${manifestation.temperature}
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