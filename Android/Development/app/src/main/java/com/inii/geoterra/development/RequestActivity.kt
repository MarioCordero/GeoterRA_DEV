package com.inii.geoterra.development

import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.Button
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.lifecycle.lifecycleScope
import com.google.android.material.bottomnavigation.BottomNavigationView
import com.inii.geoterra.development.components.ActivityNavigator
import com.inii.geoterra.development.components.OnFragmentInteractionListener
import com.inii.geoterra.development.components.api.RequestDataCard
import com.inii.geoterra.development.components.api.RequestsSubmittedResponse
import com.inii.geoterra.development.components.api.RetrofitClient
import com.inii.geoterra.development.components.services.SessionManager
import com.inii.geoterra.development.fragments.FormFragment
import com.inii.geoterra.development.ui.RequestSheet
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import retrofit2.Call
import retrofit2.Response

class RequestActivity : AppCompatActivity(), OnFragmentInteractionListener {
  private var submittedRequest : List<RequestDataCard> = listOf()
  private lateinit var bottomNavigationView : BottomNavigationView
  private lateinit var rootView : View
  /**
   *
   */
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    enableEdgeToEdge()
    setContentView(R.layout.activity_request)
    ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.requestLayout)) { v, insets ->
      val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
      v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
      insets
    }
    this.rootView = findViewById(R.id.requestLayout)
    // Initialize the bottom navigation view
    this.bottomNavigationView = this.rootView.findViewById(R.id.bottom_menu)
    if (SessionManager.isSessionActive()) {
      getSubmittedRequests()
    }

    setupBottomMenuListener()

    val requestButton = this.rootView.findViewById<Button>(R.id.newRequestButton)
    setRequestButtonClickListener(requestButton)
  }


  private fun setRequestButtonClickListener(requestButton : Button) {
    requestButton.setOnClickListener {
      if (SessionManager.isSessionActive()) {
        showForms()
      } else {
        Toast.makeText(
          this,
          "Por favor inicie sesión para poder realizar solicitudes de datos",
          Toast.LENGTH_SHORT
        ).show()
      }
    }
  }

  private fun getSubmittedRequests() {
    lifecycleScope.launch(Dispatchers.IO) {
      try {
        val apiService = RetrofitClient.getAPIService()
        val call = apiService.getSubmittedRequests(SessionManager.getUserEmail().toString())
        call.enqueue(object : retrofit2.Callback<RequestsSubmittedResponse> {
          override fun onResponse(call : Call<RequestsSubmittedResponse>,
                                  response : Response<RequestsSubmittedResponse>) {
            if (response.isSuccessful) {
              // Handle the successful response
              submittedRequest = response.body()!!.requests
              lifecycleScope.launch(Dispatchers.Main) {
                updateUIWithRequests()
              }
            }
          }

          override fun onFailure(call : Call<RequestsSubmittedResponse>, t : Throwable) {
            Log.e("RequestError", "Error al cargar los requests: ${t.message}")
          }
        })

      } catch (e : Error) {
        withContext(Dispatchers.Main) {
          Log.e(
            "Thread Error: ",
            "No se pudo iniciar el lifecycle de getSubmittedRequests"
          )
        }
      }
    }
  }

  private fun updateUIWithRequests() {
    val sheetScrollView = findViewById<LinearLayout>(R.id.sheetsLayout)
    sheetScrollView.removeAllViews()

    // Create a request sheet for each submitted request
    for (request in submittedRequest) {
      val requestSheet = RequestSheet(this)
      // Log.i("Request: ", request.toString())
      // Set the information of the request sheet
      requestSheet.setInformation(
        request.latitude, request.longitude,
        request.date,
        "Recibido"
      )
      sheetScrollView.addView(requestSheet)
    }
  }
  private fun showForms() {
    val formsFragment = FormFragment()
    // Hide the request button and text.
    val requestButton = this.rootView.findViewById<Button>(R.id.newRequestButton)
    requestButton.visibility = View.INVISIBLE
    val requestText = this.rootView.findViewById<TextView>(R.id.requestText)
    requestText.visibility = View.INVISIBLE
    val scrollView = this.rootView.findViewById<FrameLayout>(R.id.requestScrollView)
    scrollView.visibility = View.INVISIBLE
    // Show the form fragment.
    val frame = this.rootView.findViewById<FrameLayout>(R.id.formFrame)
    frame.visibility = View.VISIBLE

    //Begin the transaction.
    supportFragmentManager.beginTransaction()
      .replace(R.id.formFrame, formsFragment)
      .commit()

  }

  /**
   * Setup bottom menu listener
   *
   */
  private fun setupBottomMenuListener() {
    // Set the selected item in the bottom navigation view
    this.bottomNavigationView.selectedItemId = R.id.dashboardItem
    // Set up the bottom navigation listener
    bottomNavigationView.setOnItemSelectedListener { item ->
      // Handle item selection and navigate to the corresponding activity
      when (item.itemId) {
        R.id.homeItem -> {
          ActivityNavigator.changeActivity(this, MainActivity::class.java)
          true
        }
        R.id.mapItem-> {
          ActivityNavigator.changeActivity(this, MapActivity::class.java)
          true
        }
        R.id.accountItem -> {
          // Checks if the user is logged in
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
  }

  override fun onFragmentFinished() {
    // Ends the related fragment and returns to this activity.
    val fragment = supportFragmentManager.findFragmentById(R.id.requestLayout)
    // Remove the fragment from the back stack
    if (fragment != null) {
      supportFragmentManager.beginTransaction()
        .remove(fragment)
        .commit()
    }
  }
}



