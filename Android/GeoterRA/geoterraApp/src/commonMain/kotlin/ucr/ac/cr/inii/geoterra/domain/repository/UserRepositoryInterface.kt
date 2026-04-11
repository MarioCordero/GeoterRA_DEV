package ucr.ac.cr.inii.geoterra.domain.repository

import ucr.ac.cr.inii.geoterra.data.model.remote.UserRemote
import ucr.ac.cr.inii.geoterra.data.model.remote.UserUpdateRequest

interface UserRepositoryInterface {
  suspend fun getMe(): Result<UserRemote>
  suspend fun updateMe(request: UserUpdateRequest): Result<String>

  suspend fun deleteMe(): Result<String>
}