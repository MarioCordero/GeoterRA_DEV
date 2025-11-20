package com.inii.geoterra.development.ui.account.models

import android.content.Context
import android.util.Log
import android.util.Patterns
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.viewModelScope
import com.inii.geoterra.development.Geoterra
import com.inii.geoterra.development.api.Error
import com.inii.geoterra.development.api.SignUpResponse
import com.inii.geoterra.development.api.SingUpCredentials
import com.inii.geoterra.development.interfaces.PageViewModel
import dagger.hilt.android.lifecycle.HiltViewModel
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.launch
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import timber.log.Timber
import javax.inject.Inject

/**
 * @brief ViewModel for handling user sign-up logic.
 *
 * Manages validation, API interaction, and result propagation for sign-up flow.
 */
@HiltViewModel
class SignUpViewModel @Inject constructor(
  private val app : Geoterra,
) : PageViewModel(app) {

  /** Observable sign-up success flag */
  private val _signUpSuccess = MutableLiveData<Boolean>()
  val signUpSuccess: LiveData<Boolean> get() = _signUpSuccess

  /** Executes client-side input validation */
  fun validateAndCreateUser(credentials: SingUpCredentials) {
    this.viewModelScope.launch {
      when {
        credentials.email.isBlank() || credentials.password.isBlank() -> {
          _errorMessage.value = "Por favor, complete todos los campos"
        }
        !credentials.email.isValidEmail() -> {
          _errorMessage.value = "Por favor, ingrese una dirección de correo válida"
        }
        credentials.phoneNumber.isBlank() -> {
          _errorMessage.value = "Por favor, ingrese un número de teléfono"
        }
        credentials.phoneNumber.length < 8 -> {
          _errorMessage.value = "Por favor, ingrese un número de teléfono válido"
        }
        credentials.firstName.isBlank() -> {
          _errorMessage.value = "Por favor, ingrese su nombre"
        }
        credentials.lastName.isBlank() -> {
          _errorMessage.value = "Por favor, ingrese su apellido"
        }
        credentials.password.length < 4 -> {
          _errorMessage.value = "La contraseña debe tener al menos 4 caracteres"
        }
        else -> createUser(credentials)
      }
    }
  }

  /**
   * Executes the registration call to the API.
   *
   * @param credentials Validated sign-up credentials.
   */
  private fun createUser(credentials: SingUpCredentials) {
    this.API.signUp(
      credentials.email,
      credentials.password,
      credentials.firstName,
      credentials.lastName,
      credentials.phoneNumber
    ).enqueue(object : Callback<SignUpResponse> {

      override fun onResponse(call: Call<SignUpResponse>,
        serverResponse: Response<SignUpResponse>) {
        Timber.i("SignUpResponse: ${serverResponse.body()}")
        if (serverResponse.isSuccessful) {
          serverResponse.body()?.let {
            when (it.response) {
              "Ok" -> {
                _signUpSuccess.value = true
              }
              "Error" -> {
                handleServerErrors(it.errors)
              }
            }
          }
        } else {
          _errorMessage.value = "Error del servidor: ${serverResponse.code()}"
        }
      }

      override fun onFailure(call: Call<SignUpResponse>, t: Throwable) {
        _errorMessage.value = "Error de conexión: ${t.message}"
        Timber.e("Error de conexión: ${t.message}")
      }
    })
  }

  /**
   * @brief Processes server validation errors and emits them to observers.
   *
   * @param errors List of API-provided errors.
   */
  private fun handleServerErrors(errors: Map<String, String>?) {
    val combined = errors?.values?.joinToString(", ") ?:
    "Error desconocido"
    _errorMessage.value = combined
  }

  fun setErrorMessage(msg: String) {
    _errorMessage.value = msg

  }

}
