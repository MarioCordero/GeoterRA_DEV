package com.inii.geoterra.development

import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.FrameLayout
import android.widget.TextView
import android.widget.Toast
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.cardview.widget.CardView
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.lifecycle.lifecycleScope
import com.google.android.material.bottomnavigation.BottomNavigationView
import com.inii.geoterra.development.components.ActivityNavigator
import com.inii.geoterra.development.components.OnFragmentInteractionListener
import com.inii.geoterra.development.components.api.Error
import com.inii.geoterra.development.components.api.RetrofitClient
import com.inii.geoterra.development.components.api.SignInCredentials
import com.inii.geoterra.development.components.api.SignInResponse
import com.inii.geoterra.development.components.services.GPSManager
import com.inii.geoterra.development.components.services.SessionManager
import com.inii.geoterra.development.fragments.SignUpFragment
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response


class LoginActivity : AppCompatActivity(), OnFragmentInteractionListener {

    private lateinit var loginButton : Button
    private lateinit var bottomNavigationView : BottomNavigationView
    private val rootView : View = findViewById(R.id.loginLayout)

    override fun onCreate(savedInstanceState: Bundle?) {
        SessionManager.init(this)

        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_login)
        ViewCompat.setOnApplyWindowInsetsListener(this.rootView.findViewById(R.id.loginLayout)
) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }

        // Initialize the bottom navigation view
        this.bottomNavigationView = this.rootView.findViewById(R.id.bottom_menu)


        setupBottomMenuListener()

        loginButton = this.rootView.findViewById(R.id.loginButton)

        loginButton.setOnClickListener {
            val userEmail = findViewById<EditText>(R.id.userEmail).text.toString().trim()
            val userPassword = findViewById<EditText>(R.id.password).text.toString().trim()

            Log.i("Tomado de datos en login", "$userEmail $userPassword")
            if (userEmail.isNotBlank() && userPassword.isNotBlank()) {
                if (userEmail.isValidEmail() && userPassword.length >= 8) {
                    val credentials = SignInCredentials(
                        email = userEmail,
                        password = userPassword
                    )
                    loginUser(credentials)
                } else if (!userEmail.isValidEmail()) {
                    showError("Por favor, ingresa un correo válido.")
                } else if (userPassword.length < 8) {
                    showError("Por favor, ingresa una contraseña con al menos 8 carácteres.")
                }
            } else {
                showError("Por favor, rellena todos los campos")
            }
        }
        val sigUp = findViewById<TextView>(R.id.signUpText)
        sigUp.setOnClickListener {
            showSignUpForm()
        }

    }

    private fun loginUser(credentials : SignInCredentials) {
        lifecycleScope.launch(Dispatchers.IO) {
            try {
                withContext(Dispatchers.Main) {
                    sendCredentialsAsForm(credentials)
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    showError(e.message ?: "Error desconocido")
                }
            }
        }
    }

    private fun sendCredentialsAsForm(credentials : SignInCredentials) {
        val apiService = RetrofitClient.getAPIService()
        val call = apiService.signIn(credentials.email, credentials.password)

        call.enqueue(object : Callback<SignInResponse> {
            override fun onResponse(call: Call<SignInResponse>, response:
                Response<SignInResponse>) {
                if (response.isSuccessful) {
                    val serverResponse = response.body()
                    if (serverResponse != null) {
                        val status = serverResponse.status
                        val errors = serverResponse.errors
                        if (errors.isEmpty()) {
                            if (status == "logged_in") {
                                SessionManager.startSession(credentials.email)
                                Log.i("Success", "Login exitoso sin errores" +
                                        " adicionales$errors")
                                switchToUserDashboard()
                            } else {
                                Log.i("failed", "El usuario ya tiene un sesion activa")
                            }
                        } else {
                            handleServerErrors(errors)
                        }
                    }
                }
            }

            override fun onFailure(call: Call<SignInResponse>, t: Throwable) {
                Log.i("Error conexion", "Error: ${t.message}")
                showError("Error de conexión: ${t.message}")
            }
        })
    }

    private fun handleServerErrors(errors : List<Error>) {
        // Logs the errors to the console
        for (error in errors) {
            Log.i(error.type, error.message)
        }
    }

    private fun switchToUserDashboard() {
        ActivityNavigator.changeActivity(this, UserDashboardActivity::class.java)
    }

    private fun showError(message: String) {
        // Show the error message to the user
        runOnUiThread {
            Toast.makeText(this, message, Toast.LENGTH_LONG).show()
        }
    }

    private fun String.isValidEmail(): Boolean {
        return this.isNotEmpty() && android.util.Patterns.EMAIL_ADDRESS.matcher(this).matches()
    }

    private fun showSignUpForm() {
        val loginSpace = findViewById<CardView>(R.id.loginCard)
        loginSpace.visibility = View.INVISIBLE
        val fragmentSpace = findViewById<FrameLayout>(R.id.signupFragmentSpace)
        fragmentSpace.visibility = View.VISIBLE

        val signUpFragment = SignUpFragment()
        // Add the fragment to the container
        supportFragmentManager.beginTransaction()
            .replace(R.id.signupFragmentSpace, signUpFragment)
            .commit()
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
                R.id.mapItem -> {
                    // Start the gps service or ask for permissions
                    if (GPSManager.isInitialized()) {
                        ActivityNavigator.changeActivity(this, MapActivity::class.java)
                    } else {
                        GPSManager.initialize(this)
                    }
                    true
                }
                R.id.dashboardItem-> {
                    ActivityNavigator.changeActivity(this, RequestActivity::class.java)
                    true
                }
                else -> false
            }
        }
    }

    override fun onFragmentFinished() {
        // Ends the opened fragment and returns to this activity
        ActivityNavigator.changeActivity(this, LoginActivity::class.java)
        supportFragmentManager.popBackStack()
    }
}