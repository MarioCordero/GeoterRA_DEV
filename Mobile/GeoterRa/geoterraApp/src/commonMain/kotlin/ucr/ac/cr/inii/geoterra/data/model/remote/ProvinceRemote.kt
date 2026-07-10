package ucr.ac.cr.inii.geoterra.data.model.remote

import kotlinx.serialization.Serializable

@Serializable
data class ProvinceRemote(
  val province_id: String,
  val province_snit_code: Int,
  val province_name: String,
  val created_at: String
)