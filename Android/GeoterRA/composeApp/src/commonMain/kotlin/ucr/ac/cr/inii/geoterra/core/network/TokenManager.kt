package ucr.ac.cr.inii.geoterra.core.network

import com.russhwolf.settings.Settings
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock

/**
 * Handles local persistence of authentication tokens.
 */
class TokenManager(private val settings: Settings) {
  private val mutex = Mutex()
  
  companion object {
    private const val KEY_ACCESS_TOKEN = "access_token"
    private const val KEY_REFRESH_TOKEN = "refresh_token"
  }
  
  suspend fun saveTokens(access: String, refresh: String) {
    mutex.withLock {
      settings.putString(KEY_ACCESS_TOKEN, access)
      settings.putString(KEY_REFRESH_TOKEN, refresh)
    }
  }
  
  suspend fun getAccessToken(): String? =
    mutex.withLock { settings.getStringOrNull(KEY_ACCESS_TOKEN) }
  
  suspend fun getRefreshToken(): String? =
    mutex.withLock { settings.getStringOrNull(KEY_REFRESH_TOKEN) }
  
  suspend fun clearTokens() {
    mutex.withLock {
      settings.remove(KEY_ACCESS_TOKEN)
      settings.remove(KEY_REFRESH_TOKEN)
    }
  }
}