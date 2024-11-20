package com.inii.geoterra.development

import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import com.google.android.material.bottomnavigation.BottomNavigationView
import com.inii.geoterra.development.components.ActivityNavigator
import com.inii.geoterra.development.components.api.CheckSessionResponse
import com.inii.geoterra.development.components.api.RetrofitClient
import com.inii.geoterra.development.components.api.UserInformation
import com.inii.geoterra.development.components.services.GPSManager
import com.inii.geoterra.development.components.services.SessionManager
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class UserDashboardActivity : AppCompatActivity() {
  private lateinit var accountInformation : UserInformation
  private lateinit var bottomNavigationView : BottomNavigationView
  private lateinit var rootView : View

  override fun onCreate(savedInstanceState : Bundle?) {
    super.onCreate(savedInstanceState)
    enableEdgeToEdge()
    setContentView(R.layout.activity_user_dashboard)
    ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.UserDashBoard)) { v, insets ->
      val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
      v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
      insets
    }
    this.accountInformation = UserInformation("", "", "", "")
    this.rootView = findViewById(R.id.UserDashBoard)
    // Initialize the bottom navigation view
    this.bottomNavigationView = findViewById(R.id.bottom_menu)

    setupBottomMenuListener()

    val helpButton = findViewById<Button>(R.id.helpButton)
    helpButton.setOnClickListener{
      checkSession()

    }

    getUserInformation()

    val userActivityButton = findViewById<Button>(R.id.activityButton)
    userActivityButton.setOnClickListener {
      ActivityNavigator.changeActivity(this, RequestActivity::class.java)
    }

    println("Nombre del usuario: ${accountInformation.name}, Email: ${accountInformation.email}," +
                    " Phone: ${accountInformation.phone}")


  }

  private fun showUserInformation() {
    val nameTextView = findViewById<TextView>(R.id.userName)
    nameTextView.text = accountInformation.name
  }

  private fun getUserInformation() {
    // Create a new request.
    val apiService = RetrofitClient.getAPIService()
    val call = apiService.getUserInfo(SessionManager.getUserEmail()!!)

    // Send the request.
    call.enqueue(object : Callback<UserInformation>{
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

  private fun handleServerErrors(message : String) {
    // Handle the server errors.
    Log.i("Error de datos del usuario", message)
  }

  private fun showError(message: String) {
    // Show an error message to the user.
    Toast.makeText(UserDashboardActivity@this, message, Toast.LENGTH_LONG).show()
  }

  /**
   * Setup bottom menu listener
   *
   */
  private fun setupBottomMenuListener() {
    // Set the selected item in the bottom navigation view
    this.bottomNavigationView.selectedItemId = R.id.accountItem
    // Set up the bottom navigation listener
    bottomNavigationView.setOnItemSelectedListener { item ->
      // Handle item selection and navigate to the corresponding activity
      when (item.itemId) {
        R.id.homeItem -> {
          ActivityNavigator.changeActivity(this, MainActivity::class.java)
          true
        }
        R.id.mapItem-> {
          // Start the gps service or ask for permissions
          if (GPSManager.isInitialized()) {
            ActivityNavigator.changeActivity(this, MapActivity::class.java)
          } else {
            GPSManager.initialize(this)
          }
          true
        }
        R.id.dashboardItem -> {
          ActivityNavigator.changeActivity(this, RequestActivity::class.java)
          true
        }
        else -> false
      }
    }
  }

  private fun checkSession() {
    val apiService = RetrofitClient.getAPIService()
    val call = apiService.checkSession()
    call.enqueue(object : Callback<CheckSessionResponse> {
      override fun onResponse(call : Call<CheckSessionResponse>,
                              response : Response<CheckSessionResponse>) {
        if (response.isSuccessful) {
          val userData = response.body()
          if (userData != null) {
            Log.i("consulta sesion", "entraaa")
            Log.i(userData.status, userData.userName)
            if (userData.status == "logged_in") {
              //sessionActive = true
              Log.i("sesion activa", "entraaa")
            } else {
              Log.i("consulta sesion", "inactiva")
              //sessionActive = false
            }
          }
        }
      }

      override fun onFailure(call : Call<CheckSessionResponse>, t : Throwable) {
        //Log.i("Error check", "Error en la consulta de session, $t")
      }
    })
  }
}