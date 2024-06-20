package com.inii.geoterra.development

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.FrameLayout
import android.widget.TextView
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.cardview.widget.CardView
import androidx.constraintlayout.widget.ConstraintLayout
import androidx.core.content.ContextCompat
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.lifecycle.lifecycleScope
import com.google.android.material.bottomnavigation.BottomNavigationView
import com.google.android.material.snackbar.Snackbar
import com.inii.geoterra.development.Components.Credentials
import com.inii.geoterra.development.Components.LoginErrorResponse
import com.inii.geoterra.development.Components.RetrofitClient
import com.inii.geoterra.development.ui.SignUpFragment
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONObject
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response


class LoginActivity : AppCompatActivity() {

    private var email : String = ""
    private var password : String = ""
    lateinit var loginButton : Button
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
                    changeActivity(MainActivity::class.java, this::class.java)
                    true
                }
                R.id.dashboardItem-> {
                    // Iniciar la actividad DashboardActivity
                    changeActivity(RequestActivity::class.java, this::class.java)
                    true
                }
                R.id.mapItem -> {
                    // Iniciar la actividad NotificationsActivity
                    changeActivity(MapActivity::class.java, this::class.java)
                    true
                }
                else -> false
            }
        }
        loginButton = findViewById<Button>(R.id.loginButton)
        loginButton.setOnClickListener {

            email = findViewById<EditText>(R.id.userEmail).text.toString().trim()
            password = findViewById<EditText>(R.id.password).text.toString().trim()

            Log.i("Tomado de datos en login", "$email $password")
            if (email.isNotBlank() && password.isNotBlank()) {
                if (email.isValidEmail() && password.length >= 8) {
                    loginUser(email, password)
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

    private fun loginUser(email: String, password: String) {
        lifecycleScope.launch(Dispatchers.IO) {
            try {
                withContext(Dispatchers.Main) {
                    val credentials = Credentials(email, password)
                    sendCredentials(credentials)
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    showError(e.message ?: "Error desconocido")
                }
            }
        }
    }

    private fun sendCredentials(credentials:Credentials) {
        RetrofitClient.APIService.login(credentials).enqueue(object : Callback<List<LoginErrorResponse>> {
            override fun onResponse(call: Call<List<LoginErrorResponse>>, response: Response<List<LoginErrorResponse>>) {
                if (response.isSuccessful) {
                    val errors = response.body()
                    if (errors != null) {
                        for (error in errors) {
                            // Manejar los errores
                            Log.i("Se leyeron bien", "Error: $error.")
                        }
                    }
                } else {
                    val errors = response.body()
                    if (errors != null) {
                        for (error in errors) {
                            // Manejar los errores
                            Log.i("ocurrieron errores", "Error: $error")
                        }
                    }
                }
            }

            override fun onFailure(call: Call<List<LoginErrorResponse>>, t: Throwable) {
                // Manejar el caso de fallo en la llamada
                Log.i("Error conexion", "Error:  ${t.message}")
            }
        })
    }

    private fun showError(errorMessage: String) {
        Log.i("Login request Error", errorMessage)
        runOnUiThread {
            Snackbar.make(loginButton, errorMessage, Snackbar.LENGTH_LONG).show()
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
        val drawable = ContextCompat.getDrawable(this, R.drawable.rocklake)
        findViewById<ConstraintLayout>(R.id.loginLayout).background = drawable

        val signUpFragment = SignUpFragment.newInstance("hola", "pedro")
        // Insertar el fragmento en el contenedor
        supportFragmentManager.beginTransaction()
            .replace(R.id.signupFragmentSpace, signUpFragment)
            .commit()
    }


    /**
     *
     */
    private fun changeActivity(destinationActivity: Class<*>, currentActivity: Class<*>) {
        if (destinationActivity != currentActivity) {
            val intent = Intent(this, destinationActivity)
            startActivity(intent)
        }
    }

}