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
import com.inii.geoterra.development.components.api.CheckSessionResponse
import com.inii.geoterra.development.components.api.RetrofitClient
import com.inii.geoterra.development.components.services.GPSManager
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class UserDashboardActivity : AppCompatActivity() {
  private lateinit var bottomNavigationView : BottomNavigationView
  override fun onCreate(savedInstanceState : Bundle?) {
    super.onCreate(savedInstanceState)
    enableEdgeToEdge()
    setContentView(R.layout.activity_user_dashboard)
    ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.UserDashBoard)) { v, insets ->
      val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
      v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
      insets
    }

    // Initialize the bottom navigation view
    this.bottomNavigationView = findViewById(R.id.bottom_menu)

    setupBottomMenuListener()

    val helpButton = findViewById<Button>(R.id.helpButton)
    helpButton.setOnClickListener{
      checkSession()

    }

    val userActivityButton = findViewById<Button>(R.id.activityButton)
    userActivityButton.setOnClickListener {
      ActivityNavigator.changeActivity(this, RequestActivity::class.java)
    }
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