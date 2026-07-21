package ucr.ac.cr.inii.geoterra.data.model.responses

import kotlinx.serialization.Serializable

@Serializable
data class ProvinceResponse(
  val province_id: String,
  val province_snit_code: Int,
  val province_name: String,
  val created_at: String
)