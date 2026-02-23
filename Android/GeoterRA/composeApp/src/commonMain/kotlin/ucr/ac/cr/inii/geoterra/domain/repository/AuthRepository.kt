package ucr.ac.cr.inii.geoterra.domain.repository

import ucr.ac.cr.inii.geoterra.data.model.remote.LoginRequest

interface AuthRepository {
  suspend fun login(request: LoginRequest): Result<Unit>
  suspend fun logout(): Result<Unit>
  
  suspend fun refreshAccessToken(): Result<Unit>
  
  suspend fun isUserLoggedIn(): Boolean
}