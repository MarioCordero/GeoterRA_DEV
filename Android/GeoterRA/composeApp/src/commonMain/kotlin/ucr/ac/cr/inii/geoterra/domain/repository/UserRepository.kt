package ucr.ac.cr.inii.geoterra.domain.repository

import ucr.ac.cr.inii.geoterra.data.model.remote.UserRemote

interface UserRepository {
    suspend fun getMe(): Result<UserRemote>
    suspend fun updateMe(name: String, lastname: String, email: String, phone: String?): Result<String>
    suspend fun deleteMe(): Result<String>
}