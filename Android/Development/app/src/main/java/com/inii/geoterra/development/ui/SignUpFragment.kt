package com.inii.geoterra.development.ui

import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.EditText
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import com.inii.geoterra.development.Components.Credentials
import com.inii.geoterra.development.Components.RegisterErrorResponse
import com.inii.geoterra.development.Components.RetrofitClient
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

      Log.i("Tomado de datos en login", "$email $password")
      if (email.isNotBlank() && password.isNotBlank()) {
        if (email.isValidEmail() && password.length >= 8) {
          createUser(email, password)
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

  private fun createUser(email: String, password: String) {
    lifecycleScope.launch(Dispatchers.IO) {
      try {
        withContext(Dispatchers.Main) {
          val credentials = Credentials(email, password)
          sendCredentials(credentials)
        }
      } catch (e: Exception) {
        withContext(Dispatchers.Main) {
          showError(e.message ?: "Error desconocido")
        }
      }
    }
  }

  private fun sendCredentials(credentials:Credentials) {
    RetrofitClient.APIService.signUp(credentials).enqueue(object : Callback<List<RegisterErrorResponse>> {
      override fun onResponse(call: Call<List<RegisterErrorResponse>>, response: Response<List<RegisterErrorResponse>>) {
        val errors = response.body()
        if (response.isSuccessful) {
          if (errors != null) {
            for (error in errors) {
              // Manejar los errores
              Log.i("Se leyeron bien", "Error: $error")
            }
          }
        } else {
          if (errors != null) {
            for (error in errors) {
              // Manejar los errores
              Log.i("ocurrieron errores", "Error: $error")
            }
          }
        }
      }

      override fun onFailure(call: Call<List<RegisterErrorResponse>>, t: Throwable) {
        // Manejar el caso de fallo en la llamada
        Log.i("Error conexion", "Error:  ${t.message}")
      }
    })
  }

  private fun showError(errorMessage: String) {
    Log.i("create Acc Error", errorMessage)
  }

  private fun String.isValidEmail(): Boolean {
    return this.isNotEmpty() && android.util.Patterns.EMAIL_ADDRESS.matcher(this).matches()
  }
}