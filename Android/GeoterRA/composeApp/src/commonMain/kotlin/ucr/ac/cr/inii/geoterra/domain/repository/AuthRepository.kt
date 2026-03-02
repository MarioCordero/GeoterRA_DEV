package ucr.ac.cr.inii.geoterra.domain.repository

import ucr.ac.cr.inii.geoterra.data.model.remote.LoginRequest
import ucr.ac.cr.inii.geoterra.data.model.remote.RegisterRequest

interface AuthRepository {
  suspend fun register(request: RegisterRequest): Result<Unit>
  suspend fun login(request: LoginRequest): Result<Unit>
  suspend fun logout(): Result<Unit>
  
  suspend fun refreshAccessToken(): Result<Unit>
  
  suspend fun isUserLoggedIn(): Boolean
}