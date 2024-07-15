package com.inii.geoterra.development.ui

import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import com.inii.geoterra.development.components.SignUpErrorResponse
import com.inii.geoterra.development.components.OnFragmentInteractionListener
import com.inii.geoterra.development.components.RetrofitClient
import com.inii.geoterra.development.components.SingUpCredentials
import com.inii.geoterra.development.R
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

// TODO: Rename parameter arguments, choose names that match
// the fragment initialization parameters, e.g. ARG_ITEM_NUMBER
private const val ARG_PARAM1 = "param1"
private const val ARG_PARAM2 = "param2"

/**
 * A simple [Fragment] subclass.
 * Use the [SignUpFragment.newInstance] factory method to
 * create an instance of this fragment.
 */
class SignUpFragment : Fragment() {
  // TODO: Rename and change types of parameters
  private var param1 : String? = null
  private var param2 : String? = null

  override fun onCreate(savedInstanceState : Bundle?) {
    super.onCreate(savedInstanceState)
    arguments?.let {
      param1 = it.getString(ARG_PARAM1)
      param2 = it.getString(ARG_PARAM2)
    }
  }

  override fun onCreateView(inflater : LayoutInflater,
                            container : ViewGroup?,
                            savedInstanceState : Bundle?) : View? {
    // Inflate the layout for this fragment
    val rootView = inflater.inflate(R.layout.fragment_sign_up, container, false)

    val createAccountB = rootView.findViewById<Button>(R.id.createAccountB)

    createAccountB.setOnClickListener {
      val email = rootView.findViewById<EditText>(R.id.userEmail).text.toString().trim()
      val password = rootView.findViewById<EditText>(R.id.userPassword).text.toString().trim()
      val firstName = rootView.findViewById<EditText>(R.id.userFirstName).text.toString().trim()
      val lastName = rootView.findViewById<EditText>(R.id.userLastName).text.toString().trim()
      val phoneNum = rootView.findViewById<EditText>(R.id.userPhoneNum).text.toString().trim()

      Log.i("Tomado de datos en login", "$email $password")
      if (email.isNotBlank() && password.isNotBlank()) {
        if (email.isValidEmail() && password.length >= 8) {
          val credentials = SingUpCredentials(
            email = email,
            password = password,
            firstName = firstName,
            lastName = lastName,
            phoneNumber = phoneNum
          )
          createUser(credentials)

          val listener = activity as? OnFragmentInteractionListener
          listener?.onFragmentFinished()
        } else if (!email.isValidEmail()) {
          showError("Por favor, ingresa un correo válido.")
        } else if (password.length < 8) {
          showError("Por favor, ingresa una contraseña con al menos 8 carácteres.")
        }
      } else {
        showError("Por favor, rellena todos los campos")
      }
    }

    return rootView
  }

  companion object {
    /**
     * Use this factory method to create a new instance of
     * this fragment using the provided parameters.
     *
     * @param param1 Parameter 1.
     * @param param2 Parameter 2.
     * @return A new instance of fragment SignUpFragment.
     */
    // TODO: Rename and change types and number of parameters
    @JvmStatic
    fun newInstance(param1 : String, param2 : String) = SignUpFragment().apply {
      arguments = Bundle().apply {
        putString(ARG_PARAM1, param1)
        putString(ARG_PARAM2, param2)
      }
    }
  }

  private fun createUser(credentials : SingUpCredentials) {
    lifecycleScope.launch(Dispatchers.IO) {
      try {
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

  private fun sendCredentials(userCredentials : SingUpCredentials) {
    val apiService = RetrofitClient.getAPIService()
    val call = apiService.signUp(userCredentials.email,
                                 userCredentials.password, userCredentials.firstName,
                                 userCredentials.lastName, userCredentials.phoneNumber)

    call.enqueue(object : Callback<List<SignUpErrorResponse>> {
      override fun onResponse(call : Call<List<SignUpErrorResponse>>,
                              response : Response<List<SignUpErrorResponse>>) {
        if (response.isSuccessful) {
          val errorResponse = response.body()
          if (errorResponse != null) {
            if (errorResponse.isEmpty()) {
              // Caso donde la respuesta del servidor indica éxito pero devuelve un arreglo vacío de errores
              Log.i("Success", "Login exitoso sin errores adicionales")
              endFragment()
            } else {
              // Caso donde hay errores específicos que manejar
              Log.i("Error", "Server returned errors: $errorResponse")
              handleServerErrors(errorResponse)
            }
          }
        } else {
          Log.i("Error", "Unexpected code ${response.code()}")
          showError("Error en la respuesta del servidor: ${response.code()}")
        }
      }

      override fun onFailure(call : Call<List<SignUpErrorResponse>>, t : Throwable) {
        Log.i("Error conexion", "Error: ${t.message}")
        showError("Error de conexión: ${t.message}")
      }

    })
  }

  private fun handleServerErrors(errors : List<SignUpErrorResponse>?) {
    // Verifica si la lista de errores no es nula y no está vacía
    if (!errors.isNullOrEmpty()) {
      for (error in errors) {
        // Aquí puedes manejar cada error individualmente
        if (error.emptyInput != null) {
          showError(error.emptyInput)
        } else if (error.emailUsed != null) {
          showError(error.emailUsed)
        } else {
          // Manejar otros tipos de errores si es necesario
          showError("Error desconocido del servidor")
        }
      }
    } else {
      // Manejar el caso donde la lista de errores es nula o vacía
      showError("Error desconocido del servidor")
    }
  }


  private fun showError(message: String) {
    // Se le muestra el mensaje de error al usuario.
    Toast.makeText(requireContext(), message, Toast.LENGTH_LONG).show()
  }

  private fun endFragment() {
    val listener = activity as? OnFragmentInteractionListener
    listener?.onFragmentFinished()
  }

  private fun String.isValidEmail(): Boolean {
    return this.isNotEmpty() && android.util.Patterns.EMAIL_ADDRESS.matcher(this).matches()
  }
}