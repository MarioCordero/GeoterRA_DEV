package ucr.ac.cr.inii.geoterra.data.model.remote

import kotlinx.serialization.Serializable


@Serializable

data class UserRemote(
  val user_id: String,
  val first_name: String,
  val last_name: String,
  val email: String,
  val phone_number: String? = null,
  val role: String,
  val created_at: String
)

@Serializable
data class UserUpdateRequest(
  val name: String,
  val lastname: String,
  val email: String,
  val phone_number: String? = null
)

@Serializable
data class UpdateUserResponse(
  val message: String
)