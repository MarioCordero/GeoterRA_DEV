package ucr.ac.cr.inii.geoterra.data.model.remote

import kotlinx.serialization.Serializable

@Serializable
data class CantonRemote(
  val canton_id: String,
  val canton_snit_code: Int,
  val canton_name: String,
  val created_at: String
)