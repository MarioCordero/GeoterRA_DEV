package ucr.ac.cr.inii.geoterra.data.model.responses

import kotlinx.serialization.Serializable

@Serializable
data class CantonResponse(
  val canton_id: String,
  val canton_snit_code: Int,
  val canton_name: String,
  val created_at: String
)