package com.inii.geoterra.development.ui.account

import android.content.Context
import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.CheckBox
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import com.inii.geoterra.development.R
import com.inii.geoterra.development.interfaces.FragmentListener
import com.inii.geoterra.development.api.RetrofitClient
import com.inii.geoterra.development.api.SignUpErrorResponse
import com.inii.geoterra.development.api.SingUpCredentials
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

/**
 * A simple [Fragment] subclass.
 */
class SignUpFragment : Fragment() {
  private var listener : FragmentListener? = null
  private lateinit var rootView : View

  override fun onCreateView(inflater : LayoutInflater,
                            container : ViewGroup?,
                            savedInstanceState : Bundle?) : View {
    // Inflate the layout for this fragment
    this.rootView = inflater.inflate(
      R.layout.fragment_sign_up, container, false
    )

    // Obtains the elements from the view.
    val createAccountB = this.rootView.findViewById<Button>(
      R.id.createAccountB)
    val showPassword = this.rootView.findViewById<LinearLayout>(
      R.id.togglePasswordLayout)
    val showPasswordCheckBox = this.rootView.findViewById<CheckBox>(
      R.id.checkBoxTogglePassword)

    // Sets the listeners for the elements.
    this.setCreateAccountClickListener(createAccountB)
    this.setTogglePasswordClickListener(showPassword)
    this.setCheckboxOnChangeListener(showPasswordCheckBox)

    return rootView
  }

  /**
   * Called when the fragment is first attached to its activity.
   */
  override fun onAttach(context: Context) {
    super.onAttach(context)
    if (context is FragmentListener) {
      this.listener = context
    }
  }

  /**
   * Called when the fragment is no longer attached to its activity.
   */
  override fun onDetach() {
    super.onDetach()
    this.listener = null
  }

  /**
   * Sets the listener for the toggle password button.
   */
  private fun setTogglePasswordClickListener(showPassword : LinearLayout) {
    // Set the listener for the toggle password button.
    showPassword.setOnClickListener {
      // Obtain the checkbox and the password EditText from the view.
      val toggleCheckBox = this.rootView.findViewById<CheckBox>(
        R.id.checkBoxTogglePassword)
      val passwordEditText = this.rootView.findViewById<EditText>(
        R.id.userPassword)
      // Toggle the checkbox state.
      toggleCheckBox.isChecked = !toggleCheckBox.isChecked
      // Update the password visibility based on the checkbox state.
      if (toggleCheckBox.isChecked) {
        passwordEditText.inputType =
          android.text.InputType.TYPE_CLASS_TEXT or
            android.text.InputType.TYPE_TEXT_VARIATION_VISIBLE_PASSWORD
      } else {
        passwordEditText.inputType =
          android.text.InputType.TYPE_CLASS_TEXT or
            android.text.InputType.TYPE_TEXT_VARIATION_PASSWORD
      }
      // Set the cursor to the end of the password field.
      passwordEditText.setSelection(passwordEditText.text.length)
    }
  }

  /**
   * Sets the listener for the checkbox that toggles the password visibility.
   */
  private fun setCheckboxOnChangeListener(checkBox : CheckBox) {
    // Obtain the password EditText from the view.
    val passwordEditText = this.rootView.findViewById<EditText>(
      R.id.userPassword)
    // Set the listener for the checkbox.
    checkBox.setOnCheckedChangeListener { _, isChecked ->
      updatePasswordVisibility(isChecked, passwordEditText)
    }
  }

  /**
   * Updates the password visibility based on the checkbox state.
   */
  private fun updatePasswordVisibility(
    checked : Boolean, passwordEditText : EditText) {
    // Update the password visibility based on the checkbox state.
    if (checked) {
      passwordEditText.inputType = android.text.InputType.TYPE_CLASS_TEXT or
              android.text.InputType.TYPE_TEXT_VARIATION_VISIBLE_PASSWORD
    } else {
      passwordEditText.inputType = android.text.InputType.TYPE_CLASS_TEXT or
              android.text.InputType.TYPE_TEXT_VARIATION_PASSWORD
    }
  }

  /**
   * Sets the listener for the create account button.
   */
  private fun setCreateAccountClickListener(createAccountB : Button) {
    createAccountB.setOnClickListener {
      // Get the fields from the form.
      val email = this.rootView.findViewById<EditText>(
        R.id.userEmail).text.toString().trim()
      val password = this.rootView.findViewById<EditText>(
        R.id.userPassword).text.toString().trim()
      val firstName = this.rootView.findViewById<EditText>(
        R.id.userFirstName).text.toString().trim()
      val lastName = this.rootView.findViewById<EditText>(
        R.id.userLastName).text.toString().trim()
      val phoneNum = this.rootView.findViewById<EditText>(
        R.id.userPhoneNum).text.toString().trim()

      Log.i("Tomado de datos en login", "$email $password")
      // Check if the fields are not empty
      if (email.isNotBlank() && password.isNotBlank()) {
        if (email.isValidEmail() && password.length >= 8) {
          // Create a credentials object to store the data.
          val credentials = SingUpCredentials(
            email = email,
            password = password,
            firstName = firstName,
            lastName = lastName,
            phoneNumber = phoneNum
          )
          // Send the credentials to the server.
          createUser(credentials)
        } else if (!email.isValidEmail()) {
          showError("Por favor, ingresa un correo válido.")
        } else if (password.length < 8) {
          showError(
            "Por favor, ingresa una contraseña con al menos 8 carácteres."
          )
        }
      } else {
        showError("Por favor, rellena todos los campos")
      }
    }
  }

  /**
   * Sends the credentials to the server.
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
        // Handle the error
        withContext(Dispatchers.Main) {
            showError(e.message ?: "Error desconocido")
        }
      }
    }
  }

  /**
   * Sends the credentials to the server.
   */
  private fun sendCredentials(userCredentials : SingUpCredentials) {
    // Obtain the API service from the Retrofit client.
    val apiService = RetrofitClient.getAPIService()
    // Create a new API call.
    val call = apiService.signUp(
      userCredentials.email, userCredentials.password,
      userCredentials.firstName, userCredentials.lastName,
      userCredentials.phoneNumber
    )

    // Enqueue the call to the server.
    call.enqueue(object : Callback<List<SignUpErrorResponse>> {
      override fun onResponse(call : Call<List<SignUpErrorResponse>>,
                              response : Response<List<SignUpErrorResponse>>
      ) {
        // Check if the response is successful.
        if (response.isSuccessful) {
          val serverResponse = response.body()
          if (serverResponse != null) {
            if (serverResponse.isEmpty()) {
              // There's no errors, so login is successful.
              Log.i("Success", "Login exitoso sin errores adicionales")
              listener?.onFragmentEvent("FINISHED")
            } else {
              // There are errors, so handle them.
              Log.i(
                "Error", "Server returned errors: $serverResponse"
              )
              handleServerErrors(serverResponse)
            }
          }
        } else {
          Log.i("Error", "Unexpected code ${response.code()}")
          showError("Error en la respuesta del servidor: ${response.code()}")
        }
      }

      override fun onFailure(
        call : Call<List<SignUpErrorResponse>>, t : Throwable) {
        Log.i("Error conexion", "Error: ${t.message}")
        showError("Error de conexión: ${t.message}")
      }

    })
  }

  /**
   * Handles the server errors.
   */
  private fun handleServerErrors(errors : List<SignUpErrorResponse>?) {
    if (!errors.isNullOrEmpty()) {
      for (error in errors) {
        // Handle each error type.
        this.showError(error.emptyInput)
      }
    } else {
      // Show an error message to the user.
      this.showError("Error desconocido del servidor")
    }
  }

  /**
   * Shows an error message to the user.
   */
  private fun showError(message: String) {
    // Show the error message to the user.
    Toast.makeText(requireContext(), message, Toast.LENGTH_LONG).show()
  }

  /**
   * Checks if the email is valid.
   */
  private fun String.isValidEmail(): Boolean {
    return this.isNotEmpty()
      && android.util.Patterns.EMAIL_ADDRESS.matcher(this).matches()
  }
}