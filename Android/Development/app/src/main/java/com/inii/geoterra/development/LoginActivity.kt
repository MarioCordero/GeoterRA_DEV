package com.inii.geoterra.development

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.Button
import android.widget.EditText
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.lifecycle.lifecycleScope
import com.google.android.material.bottomnavigation.BottomNavigationView
import com.google.android.material.snackbar.Snackbar
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import okio.IOException
import org.json.JSONArray
import org.json.JSONObject
import java.net.InetAddress

class LoginActivity : AppCompatActivity() {

    private var email : String = ""
    private var password : String = ""
    lateinit var loginButton : Button
    override fun onCreate(savedInstanceState: Bundle?) {

        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_login)
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main)) { v, insets ->
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

            //Log.i("Tomado de datos en login", "$email $password")
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
    }

    private fun loginUser(email: String, password: String) {
        lifecycleScope.launch(Dispatchers.IO) {
            try {
                val response = login(email, password)
                withContext(Dispatchers.Main) {
                    handleResponse(response)
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    showError(e.message ?: "Error desconocido")
                }
            }
        }
    }

    private suspend fun login(email : String, password : String) : String {
        val client = OkHttpClient()
        // Crear un JSONArray
        val jsonArray = JSONArray().apply {
            put(JSONObject().apply {
                put("email", email)
                put("password", password)
            })
        }


        val ipAddress = "127.0.0.1" // Cambia esta dirección IP por la del servidor que deseas probar
        val timeout = 5000 // Tiempo de espera en milisegundos

        try {
            val inetAddress = withContext(Dispatchers.IO) {
                InetAddress.getByName(ipAddress)
            }
            if (withContext(Dispatchers.IO) {
                    inetAddress.isReachable(timeout)
                }) {
                Log.d("Ping", "Ping exitoso a $ipAddress")
            } else {
                Log.d("Ping", "Ping fallido a $ipAddress")
            }
        } catch (e: IOException) {
            Log.e("Ping", "Error al realizar el ping: ${e.message}")
        }
        //bsalerno1@vimeo.com
        //hK4@+Vg'1{

        val mediaType = "application/json; charset=utf-8".toMediaTypeOrNull()
        val requestBody = jsonArray.toString().toRequestBody(mediaType)

        val request = Request.Builder()
            .url("http://localhost/API/login_model.inc.php").post(requestBody).build()
        val response = client.newCall(request).execute()

        if (!response.isSuccessful) {
            Log.i("Request Error", "${response.code}")
            throw Exception("Error en la solicitud: ${response.code}")
        }

        return response.body?.string() ?: throw Exception("No se pudo obtener una respuesta del servidor")
    }

    private fun handleResponse(response : String) {
        val jsonResponse = JSONObject(response)
        if (jsonResponse.has("invalid_cred") || jsonResponse.has("empty_input")) {
            val errorMessage = jsonResponse.toString()
            showError(errorMessage)
        } else {
            val intent = Intent(this@LoginActivity, MainActivity::class.java)
            startActivity(intent)
            finish()
        }
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