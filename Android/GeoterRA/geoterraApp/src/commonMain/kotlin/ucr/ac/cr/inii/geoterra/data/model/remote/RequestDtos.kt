package ucr.ac.cr.inii.geoterra.data.model.remote

import kotlinx.serialization.Serializable

@Serializable
data class AnalysisRequestRemote(
  val id: String,
  val name: String,
  val region_id: UInt,
  val email: String,
  val owner_contact_number: String?,
  val owner_name: String?,
  val temperature_sensation: String?,
  val bubbles: Int?,
  val details: String?,
  val current_usage: String?,
  val latitude: String,
  val longitude: String,
  val state: String,
  val created_at: String,
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

@Serializable
data class AnalysisRequestDTO(
  val region: String,
  val email: String,
  val owner_contact_number: String?,
  val owner_name: String?,
  val temperature_sensation: String?,
  val bubbles: Int?,
  val details: String?,
  val current_usage: String?,
  val latitude: Float,
  val longitude: Float,
) {
  companion object {
    /**
     * Maps a remote AnalysisRequest to a DTO.
     *
     * @param remote The remote AnalysisRequest to map.
     * @return A DTO AnalysisRequest.
     */
    fun fromRemote(remote: AnalysisRequestRemote): AnalysisRequestDTO {
      return AnalysisRequestDTO(
        region = remote.regionName(),
        email = remote.email,
        owner_contact_number = remote.owner_contact_number,
        owner_name = remote.owner_name,
        temperature_sensation = remote.temperature_sensation,

        bubbles = remote.bubbles ?: 0,

        details = remote.details,
        current_usage = remote.current_usage,

        latitude = remote.latitude.toFloatOrNull() ?: 0f,
        longitude = remote.longitude.toFloatOrNull() ?: 0f
      )
    }
  }
}
