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
import com.inii.geoterra.development.components.GPSManager
import com.inii.geoterra.development.components.OnFragmentInteractionListener
import com.inii.geoterra.development.components.RetrofitClient
import com.inii.geoterra.development.components.SessionManager
import com.inii.geoterra.development.components.SignInCredentials
import com.inii.geoterra.development.components.SignInResponse
import com.inii.geoterra.development.ui.SignUpFragment
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response


class LoginActivity : AppCompatActivity(), OnFragmentInteractionListener {

    private lateinit var loginButton : Button
    override fun onCreate(savedInstanceState: Bundle?) {
        SessionManager.init(this)

        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_login)
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.loginLayout)) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }

        val bottomNavigationView = findViewById<BottomNavigationView>(R.id.bottom_menu)
        bottomNavigationView.selectedItemId = R.id.accountItem

        bottomNavigationView.setOnItemSelectedListener { item ->
            when (item.itemId) {
                R.id.homeItem -> {
                    // Iniciar la actividad HomeActivity
                    ActivityNavigator.changeActivity(this, MainActivity::class.java)
                    true
                }
                R.id.dashboardItem-> {
                    // Iniciar la actividad DashboardActivity
                    ActivityNavigator.changeActivity(this, RequestActivity::class.java)
                    true
                }
                R.id.mapItem -> {
                    // Iniciar la actividad HomeActivity
                    if (GPSManager.isInitialized()) {
                        ActivityNavigator.changeActivity(this, MapActivity::class.java)
                    } else {
                        GPSManager.initialize(this)
                    }
                    true
                }
                else -> false
            }
        }

//        val apiService = RetrofitClient.getAPIService()
//        val call = apiService.logout()
//        call.enqueue(object : Callback<LoggedOutResponse> {
//            override fun onResponse(call: Call<LoggedOutResponse>, response: Response<LoggedOutResponse>) {
//                if (response.isSuccessful) {
//                    val serverResponse = response.body()
//                    if (serverResponse != null) {
//                        Log.d("Logged Out", serverResponse.message)
//                    }
//
//                } else {
//                    Log.d("Logged Out", "Error al cerrar sesión: ${response.code()}")
//                }
//            }
//
//            override fun onFailure(call: Call<LoggedOutResponse>, t: Throwable) {
//                Log.d("Logout", "Error en la solicitud: ${t.message}")
//            }
//        })

        loginButton = findViewById(R.id.loginButton)
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

        call.enqueue(object : Callback<SignInResponse> { // Cambiar String a List<LoginErrorResponse>
            override fun onResponse(call: Call<SignInResponse>, response: Response<SignInResponse>) {
                if (response.isSuccessful) {
                    val serverResponse = response.body()
                    if (serverResponse != null) {
                        val status = serverResponse.status
                        val errors = serverResponse.errors
                        if (errors.isEmpty()) {
                            if (status == "logged_in") {
                                SessionManager.startSession(credentials.email)
                                // Caso donde la respuesta del servidor indica éxito pero devuelve un arreglo vacío de errores
                                Log.i("Success", "Login exitoso sin errores adicionales$errors")
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

    private fun handleServerErrors(errors : List<SignInResponse.SignInErrors>) {
        // Verifica si la lista de errores no es nula y no está vacía
        for (error in errors) {
            Log.i(error.errorType, error.errorMessage)
        }
    }

    private fun switchToUserDashboard() {
        ActivityNavigator.changeActivity(this, UserDashboardActivity::class.java)
    }

    private fun showError(message: String) {
        // Se le muestra el mensaje de error al usuario.
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

        val signUpFragment = SignUpFragment.newInstance("hola", "pedro")
        // Insertar el fragmento en el contenedor
        supportFragmentManager.beginTransaction()
            .replace(R.id.signupFragmentSpace, signUpFragment)
            .commit()
    }

    override fun onFragmentFinished() {
        // Aquí manejas el comportamiento cuando el fragmento finaliza
        ActivityNavigator.changeActivity(this, LoginActivity::class.java)
        supportFragmentManager.popBackStack()
    }
}