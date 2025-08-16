package com.inii.geoterra.development.ui.account.models

import android.content.Context
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.viewModelScope
import com.inii.geoterra.development.Geoterra
import com.inii.geoterra.development.api.Error
import com.inii.geoterra.development.api.SignInCredentials
import com.inii.geoterra.development.api.SignInResponse
import com.inii.geoterra.development.interfaces.PageViewModel
import com.inii.geoterra.development.managers.SessionManager
import dagger.hilt.android.lifecycle.HiltViewModel
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.launch
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import javax.inject.Inject

/**
 * @brief ViewModel for LoginView, managing authentication state and API interaction
 *
 * Handles input validation, server communication, and exposes observable state to the UI.
 */
@HiltViewModel
class LoginViewModel @Inject constructor(
  private val app : Geoterra,
) : PageViewModel(app) {

  /** @brief LiveData for login success status */
  private val _loginSuccess = MutableLiveData<Boolean>()
  val loginSuccess: LiveData<Boolean> get() = _loginSuccess

  /**
   * @brief Validates and processes user credentials for authentication.
   * @param email User tv_email input
   * @param password User password input
   */
  fun attemptLogin(email: String, password: String) {
    this.viewModelScope.launch {
      val trimmedEmail = email.trim()
      val trimmedPassword = password.trim()

      // Validate input locally before API call
      when {
        trimmedEmail.isBlank() || trimmedPassword.isBlank() -> {
          _errorMessage.value = "Por favor, rellena todos los campos"
        }

        !trimmedEmail.isValidEmail() -> {
          _errorMessage.value = "Por favor, ingresa un correo válido."
        }

        trimmedPassword.length < 4 -> {
          _errorMessage.value = "Por favor, ingresa una contraseña con al menos 8 carácteres."
        }

        else -> {
          // All inputs are valid, proceed to API
          val credentials = SignInCredentials(trimmedEmail, trimmedPassword)
          sendCredentialsAsForm(credentials)
        }
      }
    }
  }

  /**
   * @brief Sends validated credentials to the backend API.
   * @param credentials Data class containing tv_email and password
   */
  private fun sendCredentialsAsForm(credentials: SignInCredentials) {
    this.API.signIn(credentials.email, credentials.password)
      .enqueue(object : Callback<SignInResponse> {
        override fun onResponse(call: Call<SignInResponse>, response: Response<SignInResponse>) {
          handleSignInResponse(response, credentials)
        }

        override fun onFailure(call: Call<SignInResponse>, t: Throwable) {
          _errorMessage.value = "Connection error: ${t.message}"
        }
      })
  }

  /**
   * @brief Processes the server's response to the sign-in request.
   * @param response Retrofit response from backend
   * @param credentials Used credentials for authentication
   */
  private fun handleSignInResponse(
    response: Response<SignInResponse>,
    credentials: SignInCredentials
  ) {
    response.body()?.let { serverResponse ->
      when {
        serverResponse.errors.isNotEmpty() -> handleServerErrors(serverResponse.errors)
        serverResponse.response == "Ok" -> completeLoginFlow(credentials)
        else -> _errorMessage.value = "Existing active session detected"
      }
    } ?: run {
      _errorMessage.value = "Error de autenticación: respuesta vacía"
    }
  }

  /**
   * @brief Updates error message LiveData with first server-reported error.
   * @param errors List of Error objects
   */
  private fun handleServerErrors(errors: List<Error>) {
    if (errors.isNotEmpty()) {
      _errorMessage.value = errors.first().message
    }
  }

  /**
   * @brief Completes login session setup on successful authentication.
   * @param credentials User credentials
   */
  private fun completeLoginFlow(credentials: SignInCredentials) {
    SessionManager.startSession(credentials.email)
    _loginSuccess.value = true
  }
}
