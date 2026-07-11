package ucr.ac.cr.inii.geoterra.data.model.requests

import kotlinx.serialization.Serializable

@Serializable
data class UserUpdateRequest(
  val first_name: String = "",
  val last_name: String = "",
  val email: String = "",
  val phone_number: String? = null
)