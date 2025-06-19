package com.inii.geoterra.development.ui.account

import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import com.google.android.material.card.MaterialCardView
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.inii.geoterra.development.R
import com.inii.geoterra.development.api.CheckSessionResponse
import com.inii.geoterra.development.api.UserInformation
import com.inii.geoterra.development.interfaces.PageFragment
import com.inii.geoterra.development.managers.SessionManager
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

/**
 * @brief Fragment for displaying and managing user account information
 *
 * Handles user data retrieval from API, session validation, and UI updates.
 * Extends PageFragment for navigation and lifecycle management capabilities.
 *
 * @property accountInformation Stores user data retrieved from API
 * @property binding Inflated view hierarchy reference
 */
class AccountFragment : PageFragment() {
  /** @brief Data model containing user profile information */
  private lateinit var accountInformation: UserInformation

  // =============== LIFECYCLE METHODS ===============
  /**
   * @brief Initializes fragment UI and data
   * @return Inflated view hierarchy for the fragment
   *
   * Checks active session and triggers user data loading if authenticated.
   */
  override fun onCreateView(
    inflater: LayoutInflater,
    container: ViewGroup?,
    savedInstanceState: Bundle?
  ): View {
    this.binding = inflater.inflate(
      R.layout.fragment_account,
      container,
      false
    )
    this.accountInformation = UserInformation("", "", "", "")

    if (SessionManager.isSessionActive()) {
      getUserInformation()
    }

    val settingsView = this.binding.findViewById<MaterialCardView>(
      R.id.card_settings
    )
    settingsView.setOnClickListener {
      // Navigate or handle action
    }

    val editData = this.binding.findViewById<MaterialCardView>(
      R.id.card_edit_data
    )
    editData.setOnClickListener { // Navigate or handle action
    }

    val requestHistory = this.binding.findViewById<MaterialCardView>(
      R.id.card_request_history
    )
    requestHistory.setOnClickListener { // Navigate or handle action

    }

    val logoutView = this.binding.findViewById<MaterialCardView>(
      R.id.card_logout
    )
    logoutView.setOnClickListener { // Navigate or handle action
      // Construimos el diálogo de confirmación usando MaterialAlertDialogBuilder
      MaterialAlertDialogBuilder(requireContext())
        .setTitle("Cerrar sesión") // Título del diálogo
        .setMessage("¿Estás seguro de que deseas cerrar sesión?") // Mensaje
        .setCancelable(false) // No cerrar al tocar fuera (opcional)
        .setPositiveButton("Sí") { dialog, _ ->
          // Acción al confirmar la salida
          SessionManager.endSession()
          this.listener?.onFragmentEvent("USER_LOGGED_OUT")
          dialog.dismiss()
        }
        .setNegativeButton("No") { dialog, _ ->
          // Acción al cancelar la salida (solo cerramos diálogo)
          dialog.dismiss()
        }
        .show() // Mostrar el diálogo
    }

    return binding
  }

  // =============== UI UPDATE METHODS ===============
  /**
   * @brief Updates UI components with user data
   */
  private fun showUserInformation() {
    val nameTextView = this.binding.findViewById<TextView>(R.id.userName)
    nameTextView.text = accountInformation.name
  }

  // =============== DATA HANDLING METHODS ===============
  /**
   * @brief Fetches user information from API
   *
   * Uses Retrofit to asynchronously retrieve user data based on stored email.
   * Handles both success and failure scenarios.
   */
  private fun getUserInformation() {
    this.apiService.getUserInfo(SessionManager.getUserEmail()!!).enqueue(
      object : Callback<UserInformation> {
      override fun onResponse(call: Call<UserInformation>,
        response: Response<UserInformation>) {
        if (response.isSuccessful) {
          handleUserDataResponse(response.body())
        }
      }

      override fun onFailure(call: Call<UserInformation>, t: Throwable) {
        logNetworkError("Error de conexión: ${t.message}")
        showError("Error de conexión: ${t.message}")
      }
    })
  }

  /**
   * @brief Validates current session status with backend
   */
  private fun checkSession() {
    this.apiService.checkSession().enqueue(
      object : Callback<CheckSessionResponse> {
      override fun onResponse(call: Call<CheckSessionResponse>,
        response: Response<CheckSessionResponse>) {
        if (response.isSuccessful) {
          handleSessionResponse(response.body())
        }
      }

      override fun onFailure(call: Call<CheckSessionResponse>, t: Throwable) {
        logNetworkError("Error en consulta de sesión: $t")
      }
    })
  }

  // =============== ERROR HANDLING METHODS ===============
  /**
   * @brief Processes server-side error messages
   * @param message Error description from server
   */
  private fun handleServerErrors(message: String) {
    Log.i("Error de datos del usuario", message)
  }

  // =============== PRIVATE HELPERS ===============
  /**
   * @brief Handles successful user data response
   * @param serverResponse Parsed API response data
   */
  private fun handleUserDataResponse(serverResponse: UserInformation?) {
    if (serverResponse?.status == "success") {
      this.accountInformation = serverResponse.copy()
      this.showUserInformation()
    } else {
      serverResponse?.status?.let { handleServerErrors(it) }
    }
  }

  /**
   * @brief Processes session validation results
   * @param sessionData Server response with session status
   */
  private fun handleSessionResponse(sessionData: CheckSessionResponse?) {
    when (sessionData?.status) {
      "logged_in" -> Log.i("sesion activa", "entraaa")
      else -> Log.i("consulta sesion", "inactiva")
    }
  }
}