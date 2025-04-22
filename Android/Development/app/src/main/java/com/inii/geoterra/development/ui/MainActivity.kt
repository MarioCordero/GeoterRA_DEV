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
import com.inii.geoterra.development.managers.SessionManager
import com.inii.geoterra.development.ui.account.LoginFragment
import com.inii.geoterra.development.ui.home.HomeFragment
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class MainActivity : AppCompatActivity(), FragmentListener {
  private lateinit var homeFragment : HomeFragment
  private lateinit var mapFragment : MapFragment
  private lateinit var accountFragment : AccountFragment
  private lateinit var loginFragment : LoginFragment
  private lateinit var requestsFragment : RequestsFragment

  private lateinit var navegationMenu : BottomNavigationView
  private lateinit var rootView : View

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

    this.rootView = findViewById(R.id.mainLayout)
    this.navegationMenu = findViewById(R.id.nav_menu)

    SessionManager.init(this@MainActivity)
    if (! GPSManager.isInitialized()) {
      GPSManager.initialize(this@MainActivity)
    }

    this.homeFragment = HomeFragment()
    this.mapFragment = MapFragment()
    this.requestsFragment = RequestsFragment()
    this.accountFragment = AccountFragment()
    this.loginFragment = LoginFragment()

    if (savedInstanceState == null) {
      Log.i("savedInstanceState == null", "El estado de la instancia es nulo")
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

    // Aquí se agrega el callback de retroceso
    onBackPressedDispatcher.addCallback(
      this, object : OnBackPressedCallback(true) {
      override fun handleOnBackPressed() {
        if (supportFragmentManager.backStackEntryCount > 0) {
          Log.i("MainActivity", "Hay fragmentos en la pila, eliminando el último.")
          supportFragmentManager.popBackStack()  // Elimina el fragmento de la pila
        } else {
          Log.i("MainActivity", "No hay fragmentos en la pila, cerrando actividad.")
          finish()  // Si no hay fragmentos, comportamiento por defecto
        }
      }
    })

    // Manejo de navegación
    this.navegationMenu.setOnItemSelectedListener { item ->
      when (item.itemId) {
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
          if (SessionManager.isSessionActive()) {
            Log.i("nav_requests", "sesion activa")
            showFragment(this.requestsFragment)
          }
        }
        R.id.nav_account -> {
          Log.i("nav_account", "boton de cuenta presionado")

          if (SessionManager.isSessionActive()) {
            showFragment(this.accountFragment)
          } else {
            showFragment(this.loginFragment)
          }
        }
      }
      true
    }
     this.navegationMenu.selectedItemId = R.id.nav_home
  }

  private fun showFragment(fragment: Fragment) {
    this.supportFragmentManager.beginTransaction()
      .hide(homeFragment)
      .hide(mapFragment)
      .hide(requestsFragment)
      .hide(accountFragment)
      .hide(loginFragment)
      .show(fragment)
      .commit()
  }

  override fun onFragmentEvent(event: String, data: Any?) {
    when (event) {
      "USER_LOGGED_IN" -> {
        Log.i("onFragmentEvent", event)
        this.showFragment(this.accountFragment)
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