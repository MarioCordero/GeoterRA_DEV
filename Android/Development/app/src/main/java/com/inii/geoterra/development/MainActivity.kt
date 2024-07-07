package com.inii.geoterra.development

import android.os.Bundle
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import com.google.android.material.bottomnavigation.BottomNavigationView
import com.inii.geoterra.development.components.ActivityNavigator
import com.inii.geoterra.development.databinding.ActivityMainBinding

class MainActivity : AppCompatActivity() {
    lateinit var binding : ActivityMainBinding
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_main)
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.mainLayout)) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }


        val bottomNavigationView = findViewById<BottomNavigationView>(R.id.bottom_menu)
        bottomNavigationView.selectedItemId = R.id.homeItem

        bottomNavigationView.setOnItemSelectedListener { item ->
            when (item.itemId) {
                R.id.mapItem -> {
                    // Iniciar la actividad HomeActivity
                    ActivityNavigator.changeActivity(this, MapActivity::class.java)
                    true
                }
                R.id.dashboardItem-> {
                    // Iniciar la actividad RequestActivity
                    ActivityNavigator.changeActivity(this, RequestActivity::class.java)
                    true
                }
                R.id.accountItem -> {
                    // Iniciar la actividad LoginActivity
                    ActivityNavigator.changeActivity(this, LoginActivity::class.java)
                    true
                }
                else -> false
            }

        }



    }
}