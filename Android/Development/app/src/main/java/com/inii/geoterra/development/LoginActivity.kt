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
import okhttp3.MediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody
import org.json.JSONArray

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
    }

    private fun loginUser(email: String, password: String) {
        lifecycleScope.launch(Dispatchers.IO) {
            try {
                val response = login(email, password)
                handleResponse(response)
            } catch (e: Exception) {
                showError(e.message ?: "Error desconocido")
            }
        }
    }

    private suspend fun login(email: String, password: String) {
        val client = OkHttpClient()
        val json = JSONArray()
        //json.put("email", email)
        //json.put("password", password)
        //bsalerno1@vimeo.com
        //hK4@+Vg'1{

        val mediaType = MediaType.parse("application/json; charset=utf-8")
        val requestBody = RequestBody.create(mediaType, json.toString())

        val request = Request.Builder()
            .url("http://localhost/API/login_model.inc.php") // Reemplaza esto con la URL de tu API PHP
            .post(requestBody)
            .build()

//        val response = withContext(Dispatchers.IO) {
//            client.newCall(request).execute()
//        }
//        val responseBody = response.body?.byteStream()?.bufferedReader()?.use { it.readText() }
//
//
//        return response.body?.string() ?: throw Exception("No se pudo obtener una respuesta del servidor")
    }

    private fun handleResponse(response : Unit) {
//        val jsonResponse = JSONObject(response)
//        if (jsonResponse.getBoolean("success")) {
//            val intent = Intent(this@LoginActivity, MainActivity::class.java)
//            startActivity(intent)
//            finish()
//        } else {
//            showError(jsonResponse.getString("error_message"))
//        }
    }

    private fun showError(errorMessage: String) {
        runOnUiThread {
            Snackbar.make(loginButton, errorMessage, Snackbar.LENGTH_LONG).show()
        }
    }

    fun String.isValidEmail(): Boolean {
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