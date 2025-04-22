package com.inii.geoterra.development.ui.account

import android.content.Context
import android.os.Bundle
import android.util.Log
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import com.inii.geoterra.development.R
import com.inii.geoterra.development.interfaces.FragmentListener
import com.inii.geoterra.development.api.APIService
import com.inii.geoterra.development.api.CheckSessionResponse
import com.inii.geoterra.development.api.RetrofitClient
import com.inii.geoterra.development.api.UserInformation
import com.inii.geoterra.development.interfaces.PageFragment
import com.inii.geoterra.development.managers.SessionManager
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

/**
 * A simple [Fragment] subclass.
 */
class AccountFragment : PageFragment() {
  private var API_INSTANCE : APIService = RetrofitClient.getAPIService()
  private lateinit var accountInformation : UserInformation
  private lateinit var binding : View
  private var listener : FragmentListener? = null

  override fun onCreateView(
    inflater: LayoutInflater, container: ViewGroup?,
    savedInstanceState: Bundle?
  ): View {
    this.binding = inflater.inflate(R.layout.fragment_account, container, false)

    this.accountInformation = UserInformation("", "", "", "")

    val helpButton = this.binding.findViewById<Button>(R.id.helpButton)
    helpButton.setOnClickListener{
      checkSession()
    }

    if (SessionManager.isSessionActive()) {
      getUserInformation()
    }

    val userActivityButton = this.binding.findViewById<Button>(
      R.id.activityButton)
    userActivityButton.setOnClickListener {
      // ActivityNavigator.changeActivity(this, RequestActivity::class.java)
    }
    println("Nombre del usuario: ${accountInformation.name}" +
              ", Email: ${accountInformation.email}," +
              " Phone: ${accountInformation.phone}")
    // Inflate the layout for this fragment
    return binding
  }

  private fun showUserInformation() {
    val nameTextView = this.binding.findViewById<TextView>(R.id.userName)
    nameTextView.text = accountInformation.name
  }

  private fun getUserInformation() {
    // Create a new request.
    val call = this.API_INSTANCE.getUserInfo(SessionManager.getUserEmail()!!)

    // Send the request.
    call.enqueue(object : Callback<UserInformation> {
      override fun onResponse(call: Call<UserInformation>, response: Response<UserInformation>) {
        if (response.isSuccessful) {
          // Handle the response.
          val serverResponse = response.body()
          if (serverResponse != null) {
            val status = serverResponse.status
            if (status == "success") {
              accountInformation.name = serverResponse.name
              accountInformation.email = serverResponse.email
              accountInformation.phone = serverResponse.phone
              showUserInformation()
            } else {
              handleServerErrors(serverResponse.status)
            }
          }
        }
      }

      override fun onFailure(call: Call<UserInformation>, t: Throwable) {
        Log.i("Error conexion", "Error: ${t.message}")
        showError("Error de conexión: ${t.message}")
      }
    })
  }

  override fun onAttach(context: Context) {
    super.onAttach(context)
    if (context is FragmentListener) {
      listener = context
    }
  }

  override fun onDetach() {
    super.onDetach()
    listener = null
  }

  private fun handleServerErrors(message : String) {
    // Handle the server errors.
    Log.i("Error de datos del usuario", message)
  }

  private fun showError(message: String) {
    // Show an error message to the user.
    Toast.makeText(requireContext(), message, Toast.LENGTH_LONG).show()
  }

  private fun checkSession() {
    val call = this@AccountFragment.API_INSTANCE.checkSession()
    call.enqueue(object : Callback<CheckSessionResponse> {
      override fun onResponse(call : Call<CheckSessionResponse>,
        response : Response<CheckSessionResponse>
      ) {
        if (response.isSuccessful) {
          val userData = response.body()
          if (userData != null) {
            Log.i("consulta sesion", "entraaa")
            Log.i(userData.status, userData.userName)
            if (userData.status == "logged_in") { //sessionActive = true
              Log.i("sesion activa", "entraaa")
            } else {
              Log.i("consulta sesion", "inactiva") //sessionActive = false
            }
          }
        }
      }
      override fun onFailure(call : Call<CheckSessionResponse>,
        t : Throwable
      ) { //Log.i("Error check", "Error en la consulta de session, $t")
      }
    })
  }
}