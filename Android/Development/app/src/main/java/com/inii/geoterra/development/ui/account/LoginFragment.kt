package com.inii.geoterra.development.ui.account

import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.CheckBox
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.TextView
import com.inii.geoterra.development.R
import com.inii.geoterra.development.api.Error
import com.inii.geoterra.development.api.SignInCredentials
import com.inii.geoterra.development.api.SignInResponse
import com.inii.geoterra.development.interfaces.PageFragment
import com.inii.geoterra.development.managers.SessionManager
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

/**
 * @brief Fragment handling user authentication flow
 *
 * Manages login UI interactions, credential validation, and API communication.
 * Provides password visibility toggle and sign-up navigation.
 *
 * @property binding Inflated view hierarchy reference for login form
 */
class LoginFragment : PageFragment() {
  // =============== LIFECYCLE METHODS ===============
  /**
   * @brief Initializes login UI components and event listeners
   * @return Inflated view hierarchy containing login form
   */
  override fun onCreateView(
    inflater: LayoutInflater, container: ViewGroup?,
    savedInstanceState: Bundle?
  ): View {
    // Inflate the layout for this fragment
    this.binding = inflater.inflate(
      R.layout.fragment_login, container, false
    )
    this.setupViewInteractions()

    return binding
  }

  // =============== UI SETUP METHODS ===============
  /**
   * @brief Configures all UI event listeners and input validators
   */
  private fun setupViewInteractions() {
    this.setTogglePasswordClickListener()
    this.setCheckboxOnChangeListener()

    this.binding.findViewById<TextView>(R.id.signUpText).setOnClickListener {
      this.showSignUpForm()
    }

    this.binding.findViewById<Button>(R.id.loginButton).setOnClickListener {
      this.handleLoginAttempt()
    }
  }

  /**
   * @brief Toggles password field visibility state
   */
  private fun setTogglePasswordClickListener() {
    this.binding.findViewById<LinearLayout>(
      R.id.togglePasswordLayout).setOnClickListener {

      val toggleCheckBox = this.binding.findViewById<CheckBox>(
        R.id.checkBoxTogglePassword
      )

      toggleCheckBox.isChecked = !toggleCheckBox.isChecked
      this.updatePasswordVisibility(toggleCheckBox.isChecked)
    }
  }

  /**
   * @brief Registers checkbox change listener for password visibility
   */
  private fun setCheckboxOnChangeListener() {
    this.binding.findViewById<CheckBox>(R.id.checkBoxTogglePassword)
      .setOnCheckedChangeListener { _, isChecked ->
      this.updatePasswordVisibility(isChecked)
    }
  }

  // =============== AUTHENTICATION FLOW ===============
  /**
   * @brief Validates and processes user login credentials
   */
  private fun handleLoginAttempt() {
    val userEmail = this.binding.findViewById<EditText>(
      R.id.userEmail
    ).text.toString().trim()
    val userPassword = this.binding.findViewById<EditText>(
      R.id.userPassword
    ).text.toString().trim()

    Log.i("Tomado de datos en login", "$userEmail $userPassword")
    if (userEmail.isNotBlank() && userPassword.isNotBlank()) {
      if (userEmail.isValidEmail() && userPassword.length >= 8) {
        this.sendCredentialsAsForm(SignInCredentials(userEmail, userPassword))
      } else if (!userEmail.isValidEmail()) {
        this.showError("Por favor, ingresa un correo válido.")
      } else if (userPassword.length < 8) {
        this.showError(
          "Por favor, ingresa una contraseña con al menos 8 carácteres."
        )
      }
    } else {
      this.showError("Por favor, rellena todos los campos")
    }
  }

  /**
   * @brief Initiates authentication API call
   * @param credentials Validated user credentials object
   */
  private fun sendCredentialsAsForm(credentials : SignInCredentials) {
    this.apiService.signIn(
      credentials.email, credentials.password
    ).enqueue(
      object : Callback<SignInResponse> {
      override fun onResponse(call : Call<SignInResponse>,
        response : Response<SignInResponse>
      ) {
        handleSignInResponse(response, credentials)
      }

      override fun onFailure(call : Call<SignInResponse>, t : Throwable) {
        logNetworkError("Connection error: ${t.message}")
        showError("Connection error: ${t.message}")
      }
    })
  }

  // =============== RESPONSE HANDLING ===============
  /**
   * @brief Processes authentication API response
   * @param response Retrofit response object containing server data
   * @param credentials Original credentials used for authentication
   */
  private fun handleSignInResponse(response: Response<SignInResponse>,
    credentials: SignInCredentials) {
    response.body()?.let { serverResponse ->
      when {
        serverResponse.errors.isNotEmpty() -> this.handleServerErrors(
          serverResponse.errors
        )
        serverResponse.status == "logged_in" -> this.completeLoginFlow(
          credentials
        )
        else -> this.handleSessionConflict()
      }
    }
  }

  /**
   * @brief Finalizes successful login process
   */
  private fun completeLoginFlow(credentials: SignInCredentials) {
    SessionManager.startSession(credentials.email)
    this.onLoginSuccess()
  }

  // =============== ERROR HANDLING ===============
  /**
   * @brief Logs and displays server-side validation errors
   * @param errors List of error objects from API response
   */
  private fun handleServerErrors(errors: List<Error>) {
    errors.forEach { error ->
      Log.i(error.type, error.message)
      this.showError(error.message)
    }
  }

  /**
   * @brief Handles existing session conflict scenario
   */
  private fun handleSessionConflict() {
    Log.i("SessionConflict", "User already has active session")
    this.showError("Existing active session detected")
  }

  // =============== NAVIGATION METHODS ===============
  /**
   * @brief Transitions to user registration screen
   */
  private fun showSignUpForm() {
    this.requireActivity().supportFragmentManager.beginTransaction()
      .replace(R.id.mainLayout, SignUpFragment())
      .addToBackStack(null)
      .commit()
  }

  /**
   * @brief Notifies host component about successful login
   */
  private fun onLoginSuccess() {
    this.listener?.onFragmentEvent("USER_LOGGED_IN")
  }

  // =============== UTILITY METHODS ===============
  /**
   * @brief Updates password field visibility state
   * @param showPassword Flag indicating whether to display password text
   */
  private fun updatePasswordVisibility(showPassword: Boolean) {
    val passwordEditText = this.binding.findViewById<EditText>(
      R.id.userPassword
    )

    if (showPassword) {
      passwordEditText.inputType =  android.text.InputType.TYPE_CLASS_TEXT or
        android.text.InputType.TYPE_TEXT_VARIATION_VISIBLE_PASSWORD
    } else {
      passwordEditText.inputType = android.text.InputType.TYPE_CLASS_TEXT or
        android.text.InputType.TYPE_TEXT_VARIATION_PASSWORD
    }

    passwordEditText.setSelection(passwordEditText.text.length)
  }

  /**
   * @brief Validates email format using Android patterns
   * @return Boolean indicating valid email format
   */
  private fun String.isValidEmail(): Boolean {
    return this.isNotEmpty()
      && android.util.Patterns.EMAIL_ADDRESS.matcher(this).matches()
  }

}