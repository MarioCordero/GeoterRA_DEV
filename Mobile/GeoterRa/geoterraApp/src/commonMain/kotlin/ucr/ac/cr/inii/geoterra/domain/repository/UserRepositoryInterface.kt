package ucr.ac.cr.inii.geoterra.domain.repository

import ucr.ac.cr.inii.geoterra.data.model.requests.UserUpdateRequest
import ucr.ac.cr.inii.geoterra.data.model.responses.UserResponse

interface UserRepositoryInterface {
  suspend fun getMe(): Result<UserResponse>
  suspend fun updateMe(request: UserUpdateRequest): Result<String>

  suspend fun deleteMe(): Result<String>
}