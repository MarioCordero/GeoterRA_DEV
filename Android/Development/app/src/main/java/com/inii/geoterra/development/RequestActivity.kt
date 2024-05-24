package com.inii.geoterra.development

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.TextView
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import com.google.android.material.bottomnavigation.BottomNavigationView
import com.inii.geoterra.development.ui.FormFragment
import com.inii.geoterra.development.ui.RequestSheet

class RequestActivity : AppCompatActivity() {

    /**
     *
     */
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_request)
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main)) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }

        // Creates a variable to access the Bottom Menu.
        val bottomNavigationView = findViewById<BottomNavigationView>(R.id.bottom_menu)
        bottomNavigationView.selectedItemId = R.id.dashboardItem

        // Ask if the user pressed an option button.
        bottomNavigationView.setOnItemSelectedListener { item ->
            when (item.itemId) {
                R.id.homeItem -> {
                    // Iniciar la actividad HomeActivity
                    changeActivity(MainActivity::class.java, this::class.java)
                    true
                }
                R.id.mapItem -> {
                    changeActivity(MapActivity::class.java, this::class.java)
                    true
                }

                R.id.accountItem -> {
                    // Iniciar la actividad NotificationsActivity
                    changeActivity(LoginActivity::class.java, this::class.java)
                    true
                }

                else -> false
            }
        }
        val requestButton = findViewById<Button>(R.id.newRequestButton)
        requestButton.setOnClickListener {
            showForms()}

        val sheetScrollView = findViewById<LinearLayout>(R.id.sheetsLayout)
        for (i in 0 until 5) {
            val requestSheeet = RequestSheet(this)
            requestSheeet.setInformation("8,999832879 20,8236238", "24/5/2024", "Recibido")
            sheetScrollView.addView(requestSheeet)
        }

    }

    private fun showForms() {
        val formsFragment = FormFragment.newInstance("hola", "paco")

        val requestButton = findViewById<Button>(R.id.newRequestButton)
        requestButton.visibility = View.INVISIBLE
        val requestText = findViewById<TextView>(R.id.requestText)
        requestText.visibility = View.INVISIBLE
        val scrollView = findViewById<FrameLayout>(R.id.requestScrollView)
        scrollView.visibility = View.INVISIBLE
        val frame = findViewById<FrameLayout>(R.id.formFrame)
        frame.visibility = View.VISIBLE

        // Insertar el fragmento en el contenedor
        supportFragmentManager.beginTransaction()
            .replace(R.id.formFrame, formsFragment)
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



