package com.inii.geoterra.development.managers

import android.content.Context
import android.content.SharedPreferences
import android.util.Log

object SessionManager {
  private const val PREFS_NAME = "user_session_prefs"
  private const val KEY_USER_EMAIL = "user_email"
  private lateinit var sharedPreferences: SharedPreferences
  private val sessionListeners = mutableListOf<() -> Unit>()

  // Inicializa SharedPreferences
  fun init(context: Context) {
    sharedPreferences = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
  }

  // Iniciar sesión del usuario con su correo electrónico
  fun startSession(email: String) {
    sharedPreferences.edit().putString(KEY_USER_EMAIL, email).apply()
    Log.d("SessionManager", "User logged in with email: $email")
    sessionListeners.forEach { it.invoke() }
  }

  // Registrar el callback que se ejecutará cuando la sesión se active
  fun setOnSessionActiveListener(listener: () -> Unit) {
    sessionListeners.add(listener)

    if (isSessionActive()) {
      listener()  // Ejecutar inmediatamente si la sesión ya está activa
    }
  }

  // Cerrar sesión del usuario
  fun endSession() {
    sharedPreferences.edit().remove(KEY_USER_EMAIL).apply()
    Log.d("SessionManager", "User logged out")
  }

  // Verificar si la sesión está activa
  fun isSessionActive(): Boolean {
    return sharedPreferences.contains(KEY_USER_EMAIL)
  }

  // Obtener el correo electrónico del usuario actual
  fun getUserEmail(): String? {
    return sharedPreferences.getString(KEY_USER_EMAIL, null)
  }
}
