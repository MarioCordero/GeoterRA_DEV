package com.inii.geoterra.development.ui.account

import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.CheckBox
import android.widget.LinearLayout
import androidx.lifecycle.lifecycleScope
import com.inii.geoterra.development.api.Error
import com.inii.geoterra.development.api.SignUpResponse
import com.inii.geoterra.development.api.SingUpCredentials
import com.inii.geoterra.development.databinding.FragmentSignUpBinding
import com.inii.geoterra.development.interfaces.PageFragment
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

/**
 * @brief Fragment handling user registration flow
 *
 * Manages sign-up form validation, credential submission, and error handling.
 * Provides password visibility toggle and API communication for account creation.
 *
 * @property binding Inflated view hierarchy reference for registration form
 */
class SignUpFragment : PageFragment<FragmentSignUpBinding>() {

  /** Inflated view hierarchy reference for registration form */
  override val bindingInflater : (LayoutInflater, ViewGroup?, Boolean) ->
  FragmentSignUpBinding get() = FragmentSignUpBinding::inflate

  // =============== LIFECYCLE METHODS ===============
  /**
   * Called after the view hierarchy associated with the fragment has been created.
   *
   * Subclasses should implement this method to initialize view components, set up observers,
   * or restore state from [savedInstanceState].
   *
   * @param savedInstanceState If non-null, this fragment is being re-constructed from a previous saved state.
   */
  override fun onPageCreated(savedInstanceState: Bundle?) {}

  /**
   * Called to create the view hierarchy associated with this page or fragment.
   *
   * This abstract method must be implemented by subclasses to inflate and return
   * the root view of the page.
   *
   * @param inflater The LayoutInflater object that can be used to inflate any views.
   * @param container The parent view that the fragment's UI should be attached to, or null.
   * @return The root view for the fragment's UI.
   */
  override fun onPageViewCreated(inflater : LayoutInflater,
    container : ViewGroup?
  ) : View {

    this.setupViewInteractions()

    return binding.root
  }

  // =============== UI INTERACTION METHODS ===============
  /**
   * @brief Configures all UI event listeners and input validators
   */
  private fun setupViewInteractions() {
    val createAccountButton = binding.createAccountB
    val showPasswordLayout = binding.togglePasswordLayout
    val showPasswordCheckbox = binding.checkBoxTogglePassword

    // Sets the listeners for the elements.
    this.setCreateAccountClickListener(createAccountButton)
    this.setTogglePasswordClickListener(showPasswordLayout)
    this.setCheckboxOnChangeListener(showPasswordCheckbox)
  }

  /**
   * @brief Toggles password field visibility state
   * @param showPasswordLayout Container view for password toggle interaction
   */
  private fun setTogglePasswordClickListener(showPasswordLayout: LinearLayout) {
    showPasswordLayout.setOnClickListener {
      val toggleCheckBox = binding.checkBoxTogglePassword
      toggleCheckBox.isChecked = !toggleCheckBox.isChecked
      this.updatePasswordVisibility(toggleCheckBox.isChecked)
    }
  }

  /**
   * Sets the listener for the checkbox that toggles the password visibility.
   */
  private fun setCheckboxOnChangeListener(checkBox : CheckBox) {
    // Set the listener for the checkbox.
    checkBox.setOnCheckedChangeListener { _, isChecked ->
      this.updatePasswordVisibility(isChecked)
    }
  }

  /**
   * Sets the listener for the create account button.
   */
  private fun setCreateAccountClickListener(createAccountB : Button) {
    createAccountB.setOnClickListener {
      // Get the fields from the form.
      val email = this.binding.userEmail.text.toString().trim()
      val password = this.binding.userPassword.text.toString().trim()
      val firstName = this.binding.userFirstName.text.toString().trim()
      val lastName = this.binding.userLastName.text.toString().trim()
      val phone = this.binding.userPhoneNum.text.toString().trim()

      when {
        email.isBlank() || password.isBlank() -> this.showError(
          "Please fill all required fields"
        )
        !email.isValidEmail() -> this.showError(
          "Please enter a valid email address"
        )
        password.length < 4 -> this.showError(
          "Password must contain at least 4 characters"
        )
        else -> this.createUser(SingUpCredentials(
          email, password, firstName, lastName, phone)
        )
      }
    }
  }

  // =============== API COMMUNICATION ===============
  /**
   * @brief Initiates registration API call with credentials
   * @param credentials Validated user registration data
   */
  private fun createUser(credentials : SingUpCredentials) {
    // Use a coroutine to perform the API call.
    lifecycleScope.launch(Dispatchers.IO) {
      try {
        // Send the credentials to the server.
        withContext(Dispatchers.Main) {
          sendCredentials(credentials)
        }
      } catch (e: Exception) {
        withContext(Dispatchers.Main) {
          showError(e.message ?: "Error desconocido")
        }
      }
    }
  }

  /**
   * @brief Executes network request for user registration
   * @param userCredentials Sanitized user registration data
   */
  private fun sendCredentials(userCredentials : SingUpCredentials) {
    this.apiService.signUp(
      userCredentials.email, userCredentials.password,
      userCredentials.firstName, userCredentials.lastName,
      userCredentials.phoneNumber
    ).enqueue(object : Callback<SignUpResponse> {
      override fun onResponse(call : Call<SignUpResponse>,
                              response : Response<SignUpResponse>
      ) {
        when {
          response.isSuccessful -> response.body()?.let { handleRegistrationResponse(it) }
          else -> showError("Server error: ${response.code()}")
        }
      }

      override fun onFailure(
        call : Call<SignUpResponse>, t : Throwable) {
        logNetworkError("Connection failure: ${t.message}")
        showError("Connection error: ${t.message}")
      }
    })
  }

  // =============== RESPONSE HANDLING ===============
  /**
   * @brief Processes registration API response
   * @param serverResponse Parsed API response data
   */
  private fun handleRegistrationResponse(
    serverResponse: SignUpResponse) {
    when {
      serverResponse.response == "Ok" -> completeRegistration()
      else -> handleServerErrors(serverResponse.errors)
    }
  }

  /**
   * @brief Finalizes successful registration process
   */
  private fun completeRegistration() {
    this.showToast("Registro de usuario completado")
    Log.i("Registration", "Account created successfully")
    listener?.onFragmentEvent("FINISHED")
  }

  // =============== ERROR HANDLING ===============
  /**
   * @brief Processes server-side validation errors
   * @param errors List of error objects from API response
   */
  private fun handleServerErrors(errors: List<Error>) {
    errors.forEach { error ->
      Log.i("RegistrationError", error.toString())
      showError("${error.type} :  ${error.message}")
    }
  }

  // =============== UTILITY METHODS ===============
  /**
   * @brief Updates password field visibility state
   * @param showPassword Flag indicating whether to display password text
   */
  private fun updatePasswordVisibility(showPassword: Boolean) {
    val passwordEditText = this.binding.userPassword

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
    return isNotEmpty()
      && android.util.Patterns.EMAIL_ADDRESS.matcher(this).matches()
  }

}