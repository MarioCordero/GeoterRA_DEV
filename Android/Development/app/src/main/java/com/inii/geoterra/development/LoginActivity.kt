package com.inii.geoterra.development

import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.FrameLayout
import android.widget.ImageView
import android.widget.TextView
import android.widget.Toast
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.cardview.widget.CardView
import androidx.constraintlayout.widget.ConstraintLayout
import androidx.core.content.ContextCompat
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.lifecycle.lifecycleScope
import com.google.android.material.bottomnavigation.BottomNavigationView
import com.inii.geoterra.development.Components.ActivityNavigator
import com.inii.geoterra.development.Components.SignInErrorResponse
import com.inii.geoterra.development.Components.OnFragmentInteractionListener
import com.inii.geoterra.development.Components.RetrofitClient
import com.inii.geoterra.development.Components.SignInCredentials
import com.inii.geoterra.development.ui.SignUpFragment
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import java.net.InetAddress


class LoginActivity : AppCompatActivity(), OnFragmentInteractionListener {

    private var email : String = ""
    private var password : String = ""
    private lateinit var loginButton : Button
    override fun onCreate(savedInstanceState: Bundle?) {

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
                    ActivityNavigator.changeActivity(this, MainActivity::class.java, this::class.java)
                    true
                }
                R.id.dashboardItem-> {
                    // Iniciar la actividad DashboardActivity
                    ActivityNavigator.changeActivity(this, RequestActivity::class.java, this::class.java)
                    true
                }
                R.id.mapItem -> {
                    // Iniciar la actividad MapActivity
                    ActivityNavigator.changeActivity(this, MapActivity::class.java, this::class.java)
                    true
                }
                else -> false
            }
        }
        loginButton = findViewById(R.id.loginButton)
        loginButton.setOnClickListener {

            email = findViewById<EditText>(R.id.userEmail).text.toString().trim()
            password = findViewById<EditText>(R.id.password).text.toString().trim()

            Log.i("Tomado de datos en login", "$email $password")
            if (email.isNotBlank() && password.isNotBlank()) {
                if (email.isValidEmail() && password.length >= 8) {
                    val credentials = SignInCredentials(
                        email = email,
                        password = password
                    )
                    loginUser(credentials)
                } else if (!email.isValidEmail()) {
                    showError("Por favor, ingresa un correo válido.")
                } else if (password.length < 8) {
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
                val pingResult = ping("127.0.0.1")
                Log.i("Ping", pingResult)
                withContext(Dispatchers.Main) {
                    if (pingResult.contains("Ping exitoso")) {
                        sendCredentialsAsForm(credentials)
                    } else {
                        showError(pingResult)
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    showError(e.message ?: "Error desconocido")
                }
            }
        }
    }

    private fun ping(ipAddress: String): String {
        return try {
            val inetAddress: InetAddress = InetAddress.getByName(ipAddress)
            val reachable: Boolean = inetAddress.isReachable(5000) // Tiempo de espera de 5 segundos
            if (reachable) {
                "Ping exitoso a $ipAddress"
            } else {
                "Ping fallido a $ipAddress"
            }
        } catch (e: Exception) {
            "Error al hacer ping a $ipAddress: ${e.message}"
        }
    }

    private fun sendCredentialsAsForm(credentials : SignInCredentials) {
        val apiService = RetrofitClient.getAPIService()
        val call = apiService.signIn(email, password)

        call.enqueue(object : Callback<List<SignInErrorResponse>> { // Cambiar String a List<LoginErrorResponse>
            override fun onResponse(call: Call<List<SignInErrorResponse>>, response: Response<List<SignInErrorResponse>>) {
                if (response.isSuccessful) {
                    val errorResponse = response.body()
                    if (errorResponse != null) {
                        if (errorResponse.isEmpty()) {
                            // Caso donde la respuesta del servidor indica éxito pero devuelve un arreglo vacío de errores
                            Log.i("Success", "Login exitoso sin errores adicionales")
                            switchToUserDashboard()
                        } else {
                            // Caso donde hay errores específicos que manejar
                            Log.i("Error", "Server returned errors: $errorResponse")
                            handleServerErrors(errorResponse)
                        }
                    }
                } else {
                    Log.i("Error", "Unexpected code ${response.code()}")
                    showError("Error en la respuesta del servidor: ${response.code()}")
                }
            }

            override fun onFailure(call: Call<List<SignInErrorResponse>>, t: Throwable) {
                Log.i("Error conexion", "Error: ${t.message}")
                showError("Error de conexión: ${t.message}")
            }
        })
    }

    private fun handleServerErrors(errors : List<SignInErrorResponse>?) {
        // Verifica si la lista de errores no es nula y no está vacía
        if (!errors.isNullOrEmpty()) {
            for (error in errors) {
                // Aquí puedes manejar cada error individualmente
                if (error.emptyInput != null) {
                    showError(error.emptyInput)
                } else if (error.invalidCred != null) {
                    showError(error.invalidCred)
                } else {
                    // Manejar otros tipos de errores si es necesario
                    showError("Error desconocido del servidor")
                }
            }
        } else {
            // Manejar el caso donde la lista de errores es nula o vacía
            showError("Error desconocido del servidor")
        }
    }

    private fun showError(message: String) {
        // Se le muestra el mensaje de error al usuario.
        runOnUiThread {
            Toast.makeText(this, message, Toast.LENGTH_LONG).show()
        }
    }

    private fun switchToUserDashboard() {
        ActivityNavigator.changeActivity(this, UserDashboardActivity::class.java, LoginActivity::class.java)

    }

    private fun String.isValidEmail(): Boolean {
        return this.isNotEmpty() && android.util.Patterns.EMAIL_ADDRESS.matcher(this).matches()
    }

    private fun showSignUpForm() {
        val loginSpace = findViewById<CardView>(R.id.loginCard)
        loginSpace.visibility = View.INVISIBLE
        val fragmentSpace = findViewById<FrameLayout>(R.id.signupFragmentSpace)
        fragmentSpace.visibility = View.VISIBLE
        val newImage = ContextCompat.getDrawable(this, R.drawable.rocklake)
        val backgrounImage = findViewById<ImageView>(R.id.background_image)
        backgrounImage.setImageDrawable(newImage)

        val signUpFragment = SignUpFragment.newInstance("hola", "pedro")
        // Insertar el fragmento en el contenedor
        supportFragmentManager.beginTransaction()
            .replace(R.id.signupFragmentSpace, signUpFragment)
            .commit()
    }

    override fun onFragmentFinished() {
        // Aquí manejas el comportamiento cuando el fragmento finaliza
        ActivityNavigator.changeActivity(this, LoginActivity::class.java, LoginActivity::class.java)
        supportFragmentManager.popBackStack()
    }
}