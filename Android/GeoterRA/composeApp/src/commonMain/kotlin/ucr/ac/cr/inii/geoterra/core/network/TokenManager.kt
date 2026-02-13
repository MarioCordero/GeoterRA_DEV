package ucr.ac.cr.inii.geoterra.core.network

import com.russhwolf.settings.Settings

/**
 * Handles local persistence of authentication tokens.
 */
class TokenManager(private val settings: Settings) {
    companion object {
        private const val KEY_ACCESS_TOKEN = "access_token"
        private const val KEY_REFRESH_TOKEN = "refresh_token"
    }

    fun saveTokens(access: String, refresh: String) {
        settings.putString(KEY_ACCESS_TOKEN, access)
        settings.putString(KEY_REFRESH_TOKEN, refresh)
    }

    fun getAccessToken(): String? = settings.getStringOrNull(KEY_ACCESS_TOKEN)
    fun getRefreshToken(): String? = settings.getStringOrNull(KEY_REFRESH_TOKEN)

    fun clearTokens() {
        settings.remove(KEY_ACCESS_TOKEN)
        settings.remove(KEY_REFRESH_TOKEN)
    }
}