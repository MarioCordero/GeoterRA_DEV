package com.inii.geoterra.development.ui.account

import android.content.Context
import android.os.Bundle
import android.util.Log
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.CheckBox
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import com.inii.geoterra.development.R
import com.inii.geoterra.development.interfaces.FragmentListener
import com.inii.geoterra.development.api.APIService
import com.inii.geoterra.development.api.Error
import com.inii.geoterra.development.api.RetrofitClient
import com.inii.geoterra.development.api.SignInCredentials
import com.inii.geoterra.development.api.SignInResponse
import com.inii.geoterra.development.interfaces.PageFragment
import com.inii.geoterra.development.managers.SessionManager
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

/**
 * A simple [Fragment] subclass.
 */
class LoginFragment : PageFragment() {
  private lateinit var binding : View

  override fun onCreateView(
    inflater: LayoutInflater, container: ViewGroup?,
    savedInstanceState: Bundle?
  ): View {
    // Inflate the layout for this fragment
    this.binding = inflater.inflate(
      R.layout.fragment_login, container, false
    )

    // Show and hide password on toggle button click
    this.setTogglePasswordClickListener()
    this.setCheckboxOnChangeListener()

    this.binding.findViewById<Button>(R.id.loginButton).setOnClickListener {
      val userEmail = this.binding.findViewById<EditText>(R.id.userEmail)
        .text.toString().trim()
      val userPassword = this.binding.findViewById<EditText>(R.id.userPassword)
        .text.toString().trim()

      Log.i("Tomado de datos en login", "$userEmail $userPassword")
      if (userEmail.isNotBlank() && userPassword.isNotBlank()) {
        if (userEmail.isValidEmail() && userPassword.length >= 8) {
          this.sendCredentialsAsForm(SignInCredentials(userEmail, userPassword))
        } else if (!userEmail.isValidEmail()) {
          this.showError("Por favor, ingresa un correo válido.")
        } else if (userPassword.length < 8) {
          this.showError(
            "Por favor, ingresa una contraseña con al menos 8 " +
              "carácteres."
          )
        }
      } else {
        this.showError("Por favor, rellena todos los campos")
      }
    }

    this.binding.findViewById<TextView>(R.id.signUpText).setOnClickListener {
      this.showSignUpForm()
    }

    return binding
  }

  private fun showSignUpForm() {
    val signUpFragment = SignUpFragment()
    // Add the fragment to the container
    this.requireActivity().supportFragmentManager.beginTransaction()
      .replace(R.id.mainLayout, signUpFragment)
      .addToBackStack(null)
      .commit()
  }

  private fun onLoginSuccess() {
    this.listener?.onFragmentEvent("USER_LOGGED_IN")
  }

  private fun setTogglePasswordClickListener() {
    this.binding.findViewById<LinearLayout>(R.id.togglePasswordLayout)
      .setOnClickListener {
      val toggleCheckBox = this.binding.findViewById<CheckBox>(
        R.id.checkBoxTogglePassword
      )
      val passwordEditText = this.binding.findViewById<EditText>(
        R.id.userPassword
      )
      toggleCheckBox.isChecked = !toggleCheckBox.isChecked
      if (toggleCheckBox.isChecked) {
        passwordEditText.inputType =  android.text.InputType.TYPE_CLASS_TEXT or
          android.text.InputType.TYPE_TEXT_VARIATION_VISIBLE_PASSWORD
      } else {
        passwordEditText.inputType = android.text.InputType.TYPE_CLASS_TEXT or
          android.text.InputType.TYPE_TEXT_VARIATION_PASSWORD
      }
      passwordEditText.setSelection(passwordEditText.text.length)
    }
  }

  private fun setCheckboxOnChangeListener() {
    val passwordEditText = this.binding.findViewById<EditText>(
      R.id.userPassword
    )
    this.binding.findViewById<CheckBox>(R.id.checkBoxTogglePassword)
      .setOnCheckedChangeListener { _, isChecked ->
      this.updatePasswordVisibility(isChecked, passwordEditText)
    }
  }

  private fun updatePasswordVisibility(
    checked : Boolean, passwordEditText : EditText) {
    if (checked) {
      passwordEditText.inputType = android.text.InputType.TYPE_CLASS_TEXT or
        android.text.InputType.TYPE_TEXT_VARIATION_VISIBLE_PASSWORD
    } else {
      passwordEditText.inputType = android.text.InputType.TYPE_CLASS_TEXT or
        android.text.InputType.TYPE_TEXT_VARIATION_PASSWORD
    }
  }

  private fun sendCredentialsAsForm(credentials : SignInCredentials) {
    val call = this.apiService.signIn(
      credentials.email, credentials.password
    )

    call.enqueue(object : Callback<SignInResponse> {
      override fun onResponse(call : Call<SignInResponse>,
        response : Response<SignInResponse>
      ) {
        if (response.isSuccessful) {
          val serverResponse = response.body()
          if (serverResponse != null) {
            val status = serverResponse.status
            val errors = serverResponse.errors
            if (errors.isEmpty()) {
              if (status == "logged_in") {
                SessionManager.startSession(credentials.email)
                onLoginSuccess()
                Log.i("Success",
                      "Login exitoso sin errores" + " adicionales$errors")
              } else {
                Log.i("failed", "El usuario ya tiene un sesion activa")
              }
            } else {
              handleServerErrors(errors)
            }
          }
        }
      }

      override fun onFailure(call : Call<SignInResponse>, t : Throwable) {
        Log.i("Error conexion", "Error: ${t.message}")
        showError("Error de conexión: ${t.message}")
      }
    })
  }


  private fun handleServerErrors(errors : List<Error>) {
    // Logs the errors to the console
    for (error in errors) {
      Log.i(error.type, error.message)
    }
  }

  private fun showError(message: String) {
    // Show the error message to the user
    Toast.makeText(requireContext(), message, Toast.LENGTH_LONG).show()
  }

  private fun String.isValidEmail(): Boolean {
    return this.isNotEmpty()
      && android.util.Patterns.EMAIL_ADDRESS.matcher(this).matches()
  }

}