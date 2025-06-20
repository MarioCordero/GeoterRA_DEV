package com.inii.geoterra.development.ui

import android.os.Bundle
import android.util.Log
import android.view.View
import androidx.activity.OnBackPressedCallback
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.fragment.app.Fragment
import com.google.android.material.bottomnavigation.BottomNavigationView
import com.inii.geoterra.development.ui.map.MapFragment
import com.inii.geoterra.development.R
import com.inii.geoterra.development.ui.requests.RequestsFragment
import com.inii.geoterra.development.ui.account.AccountFragment
import com.inii.geoterra.development.interfaces.FragmentListener
import com.inii.geoterra.development.api.CheckSessionResponse
import com.inii.geoterra.development.api.RetrofitClient
import com.inii.geoterra.development.device.GPSManager
import com.inii.geoterra.development.interfaces.PageFragment
import com.inii.geoterra.development.managers.GalleryPermissionManager
import com.inii.geoterra.development.managers.SessionManager
import com.inii.geoterra.development.ui.account.LoginFragment
import com.inii.geoterra.development.ui.home.HomeFragment
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class MainActivity : AppCompatActivity(), FragmentListener {
  private var homeFragment : HomeFragment = HomeFragment()
  private var mapFragment : MapFragment = MapFragment()
  private var accountFragment : AccountFragment = AccountFragment()
  private var loginFragment : LoginFragment = LoginFragment()
  private var requestsFragment : RequestsFragment = RequestsFragment()

  private lateinit var navigationMenu : BottomNavigationView
  private lateinit var binding : View

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    enableEdgeToEdge()
    setContentView(R.layout.activity_main)
    ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.mainLayout)
    ) { v, insets ->
      val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
      v.setPadding(
        systemBars.left, systemBars.top,
        systemBars.right, systemBars.bottom
      )
      insets
    }
    // Initialize the root view and the navigation menu.
    this.binding = findViewById(R.id.mainLayout)
    this.navigationMenu = this.binding.findViewById(R.id.nav_menu)
    // Initialize the session manager.
    SessionManager.init(this@MainActivity)
    if (!GPSManager.isInitialized()) {
      GPSManager.initialize(this@MainActivity)
    }
    if (!GalleryPermissionManager.isInitialized()) {
      GalleryPermissionManager.initialize(this@MainActivity)
    }
    // Check if the activity is being re-created.
    if (savedInstanceState == null) {
      Log.i(
        "savedInstanceState == null",
        "El estado de la instancia es nulo"
      )
      this.setupActivity()
    }

    this.onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
      override fun handleOnBackPressed() {
        val currentFragment = listOf(homeFragment, mapFragment, requestsFragment, accountFragment, loginFragment)
          .firstOrNull { it.isVisible }

        if (currentFragment is PageFragment) {
          val handled = currentFragment.handleBackPress()
          if (!handled) {
            // Si el fragmento no maneja el back, pasar al sistema.
            if (!supportFragmentManager.popBackStackImmediate()) {
              finish() // o super.onBackPressed() en versiones más viejas
            }
          }
        } else {
          finish()
        }
      }
    })


    // Set the navigation menu item click listener.
    this.navigationMenu.setOnItemSelectedListener { item ->
      // Handle the navigation menu item click.
      this.handlePageNavigation(item.itemId)
      true
    }
    this.navigationMenu.selectedItemId = R.id.nav_home
  }

  private fun setupActivity() {
    // Add the fragments to the activity.
    supportFragmentManager.beginTransaction()
      .add(R.id.fragment_container_view, this.homeFragment, "home")
      .hide(this.homeFragment)
      .add(R.id.fragment_container_view, this.mapFragment, "map")
      .hide(this.mapFragment)
      .add(R.id.fragment_container_view, this.requestsFragment, "requests")
      .hide(requestsFragment)
      .add(R.id.fragment_container_view, this.accountFragment, "account")
      .hide(this.accountFragment)
      .add(R.id.fragment_container_view, this.loginFragment, "login")
      .hide(this.loginFragment)
      .commit()
  }

  private fun handlePageNavigation(itemID : Int) {
    when (itemID) {
      R.id.nav_home -> showFragment(this.homeFragment)
      R.id.nav_map -> {
        Log.i("nav_map", "boton de mapa presionado")
        // Start the gps service or ask for permissions
        if (GPSManager.isInitialized()) {
          GPSManager.startLocationUpdates()
          Log.i("nav_map", "gps inicializado")

          if (GPSManager.getLastKnownLocation() != null) {
            showFragment(this.mapFragment)
          }
        } else {
          Log.i("nav_map", "gps no inicializado")
          GPSManager.initialize(this)
        }
      }
      R.id.nav_requests ->  {
        Log.i("nav_requests", "boton de solicitudes presionado")
//        if (SessionManager.isSessionActive()) {
//          Log.i("nav_requests", "sesion activa")
//          showFragment(this.requestsFragment)
//        }
        showFragment(this.requestsFragment)
      }
      R.id.nav_account -> {
        Log.i("nav_account", "boton de cuenta presionado")
        if (!SessionManager.isSessionActive()) {
          showFragment(this.accountFragment)
        } else {
          showFragment(this.loginFragment)
        }
      }
    }
  }

  private fun showFragment(fragment: Fragment) {
    val transaction = supportFragmentManager.beginTransaction()

    // Call onHide on all PageFragments
    listOf(homeFragment, mapFragment, requestsFragment,
           accountFragment, loginFragment
    ).forEach {
      it.onHide()
      transaction.hide(it)
    }

    // Call onShow on the selected one
    if (fragment is PageFragment) fragment.onShow()
    transaction.show(fragment)
      .setPrimaryNavigationFragment(fragment)
      .commit()
  }

  override fun onFragmentEvent(event: String, data: Any?) {
    when (event) {
      "USER_LOGGED_IN" -> {
        Log.i("onFragmentEvent", event)
        this.showFragment(this.accountFragment)
      }
      "USER_LOGGED_OUT" -> {
        Log.i("onFragmentEvent", event)
        this.showFragment(this.loginFragment)
      }
      "FINISHED" -> {
        this.supportFragmentManager.popBackStack()
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