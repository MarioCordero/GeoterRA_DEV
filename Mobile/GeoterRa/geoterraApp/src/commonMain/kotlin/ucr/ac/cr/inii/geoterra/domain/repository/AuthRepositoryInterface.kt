package ucr.ac.cr.inii.geoterra.domain.repository

import ucr.ac.cr.inii.geoterra.data.model.requests.LoginRequest
import ucr.ac.cr.inii.geoterra.data.model.requests.RegisterRequest

interface AuthRepositoryInterface {
  suspend fun register(request: RegisterRequest): Result<Unit>
  suspend fun login(request: LoginRequest): Result<Unit>
  suspend fun logout(): Result<Unit>
  
  suspend fun refreshAccessToken(): Result<Unit>
  
  suspend fun isUserLoggedIn(): Boolean

	suspend fun requestPasswordReset(email: String): Result<Unit>

	suspend fun resetPassword(token: String, password: String): Result<Unit>
}