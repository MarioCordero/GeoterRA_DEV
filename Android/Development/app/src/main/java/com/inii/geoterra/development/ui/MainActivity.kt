package com.inii.geoterra.development.ui

import android.os.Bundle
import android.util.Log
import androidx.activity.OnBackPressedCallback
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.fragment.app.Fragment
import com.google.android.material.bottomnavigation.BottomNavigationView
import com.inii.geoterra.development.Geoterra
import com.inii.geoterra.development.ui.map.views.MapView
import com.inii.geoterra.development.R
import com.inii.geoterra.development.ui.requests.views.RequestsView
import com.inii.geoterra.development.ui.account.views.AccountView
import com.inii.geoterra.development.interfaces.FragmentListener
import com.inii.geoterra.development.api.CheckSessionResponse
import com.inii.geoterra.development.api.RetrofitClient
import com.inii.geoterra.development.databinding.ActivityMainBinding
import com.inii.geoterra.development.device.ActivityPermissionRequester
import com.inii.geoterra.development.device.GPSManager
import com.inii.geoterra.development.interfaces.PageView
import com.inii.geoterra.development.managers.SessionManager
import com.inii.geoterra.development.ui.account.views.LoginView
import com.inii.geoterra.development.ui.home.views.HomeView
import dagger.hilt.android.AndroidEntryPoint
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import javax.inject.Inject

@AndroidEntryPoint
class MainActivity : AppCompatActivity(), FragmentListener {
  @Inject
  lateinit var app: Geoterra

  private var homeFragment : HomeView = HomeView()
  private var mapView : MapView = MapView()
  private var accountView : AccountView = AccountView()
  private var loginView : LoginView = LoginView()
  private var requestsFragment : RequestsView = RequestsView()

  private lateinit var navigationMenu : BottomNavigationView
  private lateinit var binding : ActivityMainBinding

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    enableEdgeToEdge()
    this.binding = ActivityMainBinding.inflate(layoutInflater)
    setContentView(binding.root)

    ViewCompat.setOnApplyWindowInsetsListener(binding.mainContainer) { view, insets ->
      val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
      view.setPadding(
        systemBars.left, systemBars.top,
        systemBars.right, systemBars.bottom
      )
      insets
    }

    this.navigationMenu = this.binding.bottomNav
    // Check if the activity is being re-created.
    if (savedInstanceState == null) {
      Log.i(
        "savedInstanceState == null",
        "El estado de la instancia es nulo"
      )
      this.setupActivity()
      // Initialize the session manager.
      SessionManager.init(this@MainActivity)
    }

    this.onBackPressedDispatcher.addCallback(this, object :
      OnBackPressedCallback(true) {
      override fun handleOnBackPressed() {
        val currentFragment = listOf(
          homeFragment, mapView,
          requestsFragment, accountView,
          loginView
        ).firstOrNull { it.isVisible }

        if (currentFragment is PageView<*, *>) {
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
      .add(R.id.nav_host_fragment, this.homeFragment, "home")
      .hide(this.homeFragment)
      .add(R.id.nav_host_fragment, this.mapView, "map")
      .hide(this.mapView)
      .add(R.id.nav_host_fragment, this.requestsFragment, "requests")
      .hide(requestsFragment)
      .add(R.id.nav_host_fragment, this.accountView, "account")
      .hide(this.accountView)
      .add(R.id.nav_host_fragment, this.loginView, "login")
      .hide(this.loginView)
      .commit()
  }

  private fun handlePageNavigation(itemID : Int) {
    when (itemID) {
      R.id.nav_home -> {
        app.stopLocationUpdates()
        this.showFragment(this.homeFragment)
      }
      R.id.nav_map -> {
        Log.i("nav_map", "boton de mapa presionado")
        // Start the gps service or ask for permissions
        if (this.app.isGPSManagerInitialized()) {
          Log.i("nav_map", "gps inicializado")
          this.app.startLocationUpdates()
          if (this.app.getLastKnownLocation() != null) {
            this.showFragment(this.mapView)
          }
        } else {
          this.app.initLocationService(ActivityPermissionRequester(
            this)
          )
        }
      }
      R.id.nav_requests ->  {
        Log.i("nav_requests", "boton de solicitudes presionado")
        if (this.app.isGPSManagerInitialized()) {
          Log.i("nav_requests", "gps inicializado")
          this.app.startLocationUpdates()
        }
        this.showFragment(this.requestsFragment)
//        this.showFragment(this.requestsFragment)
      }
      R.id.nav_account -> {
        Log.i("nav_account", "boton de cuenta presionado")
        this.app.stopLocationUpdates()
        if (SessionManager.isSessionActive()) {
          this.showFragment(this.accountView)
        } else {
          this.showFragment(this.loginView)
        }
      }
    }
  }

  private fun showFragment(fragment: Fragment) {
    val transaction = supportFragmentManager.beginTransaction()

    // Call onHide on all PageFragments
    listOf(homeFragment, mapView, requestsFragment,
           accountView, loginView
    ).forEach {
      it.onHide()
      transaction.hide(it)
    }

    // Call onShow on the selected one
    if (fragment is PageView<*, *>) fragment.onShow()
    transaction.show(fragment)
      .setPrimaryNavigationFragment(fragment)
      .commit()
  }

  override fun onFragmentEvent(event: String, data: Any?) {
    when (event) {
      "USER_LOGGED_IN" -> {
        Log.i("onFragmentEvent", event)
        this.showFragment(this.accountView)
      }
      "USER_LOGGED_OUT" -> {
        Log.i("onFragmentEvent", event)
        this.showFragment(this.loginView)
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