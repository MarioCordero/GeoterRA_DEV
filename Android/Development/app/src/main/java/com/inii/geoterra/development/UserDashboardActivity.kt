package com.inii.geoterra.development

import android.os.Bundle
import android.util.Log
import android.widget.Button
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import com.google.android.material.bottomnavigation.BottomNavigationView
import com.inii.geoterra.development.components.ActivityNavigator
import com.inii.geoterra.development.components.CheckSessionResponse
import com.inii.geoterra.development.components.RetrofitClient
import com.inii.geoterra.development.components.SessionManager
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class UserDashboardActivity : AppCompatActivity() {
  override fun onCreate(savedInstanceState : Bundle?) {
    super.onCreate(savedInstanceState)
    enableEdgeToEdge()
    setContentView(R.layout.activity_user_dashboard)
    ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.UserDashBoard)) { v, insets ->
      val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
      v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
      insets
    }

    // Creates a variable to access the Bottom Menu.
    val bottomNavigationView = findViewById<BottomNavigationView>(R.id.bottom_menu)
    bottomNavigationView.selectedItemId = R.id.accountItem

    bottomNavigationView.setOnItemSelectedListener { item ->
      when (item.itemId) {
        R.id.homeItem -> {
          // Iniciar la actividad HomeActivity
          ActivityNavigator.changeActivity(this, MainActivity::class.java)
          true
        }
        R.id.mapItem -> {
          // Iniciar la actividad HomeActivity
          ActivityNavigator.changeActivity(this, MapActivity::class.java)
          true
        }
        R.id.dashboardItem-> {
          // Iniciar la actividad RequestActivity
          ActivityNavigator.changeActivity(this, RequestActivity::class.java)
          true
        }
        R.id.accountItem -> {
          // Iniciar la actividad LoginActivity
          if (SessionManager.isSessionActive()) {
            ActivityNavigator.changeActivity(this, UserDashboardActivity::class.java)
          } else {
            ActivityNavigator.changeActivity(this, LoginActivity::class.java)
          }
          true
        }
        else -> false
      }

    }

    val helpButton = findViewById<Button>(R.id.helpButton)
    helpButton.setOnClickListener{
      checkSession()

    }

    val userActivityButton = findViewById<Button>(R.id.activityButton)
    userActivityButton.setOnClickListener {
      ActivityNavigator.changeActivity(this, RequestActivity::class.java)
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