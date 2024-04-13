package com.inii.geoterra.development

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import com.inii.geoterra.development.databinding.ActivityMainBinding

class LoginActivity : AppCompatActivity() {


    private lateinit var binding:ActivityMainBinding

    lateinit var username : EditText
    lateinit var password : EditText
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
        val loginBtn = findViewById<Button>(R.id.loginButton)
        loginBtn.setOnClickListener {navigateToPulse()}
        //binding = ActivityMainBinding.in

    }

    fun navigateToPulse() {

    }
}