package com.inii.geoterra.development.managers

import android.content.Context
import android.content.SharedPreferences
import android.util.Log
import androidx.core.content.edit
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData

/**
 * @brief Manages user session persistence as observable state
 *
 * Responsibilities:
 * - Persist session data using SharedPreferences
 * - Expose session state as observable LiveData
 * - NEVER interact with UI or lifecycle owners directly
 */
object SessionManager {

  // ==================== CONSTANTS ====================
  private const val PREFS_NAME = "user_session_prefs"
  private const val KEY_USER_EMAIL = "user_email"

  // ==================== STORAGE ====================
  private lateinit var sharedPreferences: SharedPreferences

  // ==================== SESSION STATE ====================

  /**
   * Internal mutable session state
   */
  private val _sessionActive = MutableLiveData<Boolean>()

  /**
   * Public immutable observable session state
   */
  val sessionActive: LiveData<Boolean>
    get() = _sessionActive

  /**
   * Initializes session persistence and restores state.
   *
   * MUST be called once at application startup.
   */
  fun init(context: Context) {
    sharedPreferences = context.getSharedPreferences(
      PREFS_NAME,
      Context.MODE_PRIVATE
    )

    // Restore persisted session state
    _sessionActive.value = sharedPreferences.contains(KEY_USER_EMAIL)
  }

  /**
   * Starts a new authenticated session.
   *
   * @param email User identifier
   */
  fun startSession(email: String) {
    sharedPreferences.edit {
      putString(KEY_USER_EMAIL, email)
    }

    Log.d("SessionManager", "User logged in: $email")

    _sessionActive.value = true
  }

  /**
   * Terminates the active session.
   */
  fun endSession() {
    if (_sessionActive.value == true) {
      sharedPreferences.edit {
        remove(KEY_USER_EMAIL)
      }

      Log.d("SessionManager", "User logged out")

      _sessionActive.value = false
    }
  }

  /**
   * Checks session validity synchronously.
   */
  fun isSessionActive(): Boolean {
    return _sessionActive.value == true
  }

  /**
   * Retrieves stored user email if available.
   */
  fun getUserEmail(): String? {
    return sharedPreferences.getString(KEY_USER_EMAIL, null)
  }
}
