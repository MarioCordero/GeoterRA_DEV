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
data class AnalysisRequestFormRemote(
  val region: String,
  val email: String,
  val owner_contact_number: String?,
  val owner_name: String?,
  val temperature_sensation: String?,
  val bubbles: Boolean?,
  val details: String?,
  val current_usage: String?,
  val latitude: Float,
  val longitude: Float,
)
