package com.inii.geoterra.development.managers

import android.content.Context
import android.content.SharedPreferences
import android.util.Log
import androidx.core.content.edit

/**
 * @brief Manages user session persistence and event notifications
 *
 * Handles session lifecycle using SharedPreferences for storage and provides:
 * - Session state tracking
 * - Email-based user identification
 * - Session event listeners
 */
object SessionManager {
  // ==================== CONSTANTS ====================
  private const val PREFS_NAME = "user_session_prefs"
  private const val KEY_USER_EMAIL = "user_email"

  // ==================== STORAGE ====================
  private lateinit var sharedPreferences: SharedPreferences

  // ==================== EVENT SYSTEM ====================
  private val sessionListeners = mutableListOf<() -> Unit>()

  /**
   * @brief Initializes session storage system
   * @param context Context for SharedPreferences access
   */
  fun init(context: Context) {
    this.sharedPreferences = context.getSharedPreferences(
      PREFS_NAME,
      Context.MODE_PRIVATE
    )
  }

  /**
   * @brief Starts new authenticated session
   * @param email User identifier for the session
   */
  fun startSession(email: String) {
    sharedPreferences.edit() { putString(KEY_USER_EMAIL, email) }
    Log.d("SessionManager", "User logged in with email: $email")
    sessionListeners.forEach { it.invoke() }
  }

  /**
   * @brief Terminates current session and clears credentials
   */
  fun endSession() {
    sharedPreferences.edit() { remove(KEY_USER_EMAIL) }
    Log.d("SessionManager", "User logged out")
  }

  /**
   * @brief Registers session state change listener
   * @param listener Callback to execute on session events
   *
   * Immediately triggers callback if session is already active
   */
  fun setOnSessionActiveListener(listener: () -> Unit) {
    sessionListeners.add(listener)
    if (isSessionActive()) {
      listener()
    }
  }

  /**
   * @brief Checks session validity
   * @return Boolean indicating active session presence
   */
  fun isSessionActive(): Boolean {
    return sharedPreferences.contains(KEY_USER_EMAIL)
  }

  /**
   * @brief Retrieves stored user identifier
   * @return Email associated with current session or null
   */
  fun getUserEmail(): String? {
    return sharedPreferences.getString(KEY_USER_EMAIL, null)
  }
}