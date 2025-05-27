package com.inii.geoterra.development.ui.requests

import android.app.Activity
import android.app.DatePickerDialog
import android.content.Context
import android.content.Intent
import android.icu.text.SimpleDateFormat
import android.icu.util.Calendar
import android.media.ExifInterface
import android.net.Uri
import android.os.Bundle
import android.util.Log
import android.view.Gravity
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.CheckBox
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import android.widget.ViewSwitcher
import androidx.activity.result.contract.ActivityResultContracts
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import com.google.android.material.button.MaterialButton
import com.google.android.material.button.MaterialButtonToggleGroup
import com.google.android.material.slider.Slider
import com.inii.geoterra.development.R
import com.inii.geoterra.development.interfaces.FragmentListener
import com.inii.geoterra.development.api.Error
import com.inii.geoterra.development.api.RequestForm
import com.inii.geoterra.development.api.RequestResponse
import com.inii.geoterra.development.api.RetrofitClient
import com.inii.geoterra.development.device.GPSManager
import com.inii.geoterra.development.interfaces.PageFragment
import com.inii.geoterra.development.managers.GalleryPermissionManager
import com.inii.geoterra.development.managers.SessionManager
import com.inii.geoterra.development.ui.elements.SpringForm
import com.inii.geoterra.development.ui.elements.TerrainForm
import kotlinx.coroutines.launch
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import java.io.IOException
import java.io.InputStream
import java.util.Locale

class FormFragment : PageFragment() {
  private lateinit var binding : View
  private lateinit var requestForm : RequestForm
  private lateinit var terrainForm : TerrainForm
  private lateinit var springForm : SpringForm

  override fun onCreateView(
    inflater : LayoutInflater,
    container : ViewGroup?,
    savedInstanceState : Bundle?)
  : View {
     this.binding = inflater.inflate(
       R.layout.fragment_form, container, false
     )
    // Inflate the layout for this fragment
    // Creates an object that manage the location requests.
    this.requestForm = RequestForm()

    this.terrainForm = TerrainForm(requireContext())
    this.springForm = SpringForm(requireContext())
    this.binding.findViewById<ViewSwitcher>(
      R.id.form_container
    ).addView(this.terrainForm)
    this.binding.findViewById<ViewSwitcher>(
      R.id.form_container
    ).addView(this.springForm)

    this.binding.findViewById<MaterialButtonToggleGroup>(
      R.id.terrain_type_button_group
    ).addOnButtonCheckedListener { _, checkedId, isChecked ->
      if (isChecked) {
        when (checkedId) {
          R.id.land_type_button -> showForm(0)
          R.id.spring_type_button -> showForm(1)
        }
      }
    }

    val locationButton = this.binding.findViewById<MaterialButton>(
      R.id.gps_coordinates_button
    )
    locationButton.isChecked = true
    val imageButton = this.binding.findViewById<MaterialButton>(
      R.id.image_coordinates_button
    )
    imageButton.isChecked = false
    val sendButton = this.binding.findViewById<Button>(
      R.id.sendRequestButton
    )
    val dateText = this.binding.findViewById<TextView>(R.id.date_input)

    // Create a calendar with the current date
    val calendar = Calendar.getInstance()

    // Define the date format
    val dateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())

    // Set a click listener for the location button
    locationButton.setOnClickListener {
      if (! GPSManager.isInitialized()) {
          GPSManager.initialize(requireContext())
      } else {
        // Get the last known location.
        val userLocation = GPSManager.getLastKnownLocation()
        Log.i("Coordenadas", "Latitud ${userLocation?.latitude}" +
                "y longitud ${userLocation?.longitude}")
        if (userLocation != null) {
          Toast.makeText(
            requireContext(),
            "Latitud ${userLocation.latitude} y longitud" +
              " ${userLocation.longitude}"
            , Toast.LENGTH_SHORT).show()
          // Set the coordinates in the request form.
          requestForm.latitude = "${userLocation.latitude}"
          requestForm.longitude = "${userLocation.longitude}"
          requestForm.coordinates =
            "${userLocation.latitude}, ${userLocation.longitude}"
          Log.i(
            "Coordenadas"
            , requestForm.latitude +"  " + requestForm.longitude
          )
        }
      }
    }

    // Set a click listener for the image button
    imageButton.setOnClickListener {
      Log.i("GalleryManager", "isInitialize: ${GalleryPermissionManager.isInitialized()}")

      if (!GalleryPermissionManager.isInitialized()) {
        if (!shouldShowRequestPermissionRationale(GalleryPermissionManager.requiredPermission)) {
          // Aquí puedes mostrar un diálogo personalizado para llevar al usuario a los ajustes
          Toast.makeText(requireContext(), "Activa el permiso de galería en Configuración", Toast.LENGTH_LONG).show()
        } else {
          GalleryPermissionManager.initialize(this)  // solo esto basta
        }
      } else {
        // Ya tienes permiso
        this.openGallery()
        Log.i("GalleryManager", "Ya se abrió la galería")
      }
    }

    // Set a click listener for the date text
    val dateSetListener =
      DatePickerDialog.OnDateSetListener { _, year, month, dayOfMonth ->
      // Update the calendar with the selected date
      calendar.set(Calendar.YEAR, year)
      calendar.set(Calendar.MONTH, month)
      calendar.set(Calendar.DAY_OF_MONTH, dayOfMonth)
      // Set the date text with the selected date
      dateText.text = dateFormat.format(calendar.time)
    }

    dateText.setOnClickListener {
      // Show the date picker dialog
      val datePickerDialog = DatePickerDialog(
        requireContext(),
        android.R.style.Theme_Material_Light_Dialog,
        dateSetListener,
        calendar.get(Calendar.YEAR),
        calendar.get(Calendar.MONTH),
        calendar.get(Calendar.DAY_OF_MONTH)
      )
      datePickerDialog.show()  // Show the dialog
    }

    sendButton.setOnClickListener {
      getFormData()
      sendRequest()
    }

    return this.binding
  }

  fun showForm(index: Int) {
    val viewSwitcher = binding.findViewById<ViewSwitcher>(R.id.form_container)
    if (index >= 0 && index < viewSwitcher.childCount) {
      while (viewSwitcher.displayedChild != index) {
        viewSwitcher.showNext()
      }
    }
  }

  private fun getFormData() {
    lifecycleScope.launch {
      try {
        val identifier = binding.findViewById<EditText>(
          R.id.identifier_input
        ).text.toString()
        val region = "Guanacaste"
        val date = binding.findViewById<TextView>(R.id.date_input)
          .text.toString()
        val user = SessionManager.getUserEmail()
        val ownersName = binding.findViewById<EditText>(R.id.owners_name_input)
          .text.toString()
        val currentUsage = binding.findViewById<EditText>(
          R.id.actual_use_input
        ).text.toString()
        val address = binding.findViewById<EditText>(R.id.details_input)
          .text.toString()
        val ownersContact = binding.findViewById<EditText>(
          R.id.owner_contact_input
        ).text.toString()
        val thermalSensation = 1
//        val thermalSensation = binding.findViewById<Slider>(
//          R.id.thermal_sensation_input
//        ).value.toInt()
//        val bubbles = if (
//          binding.findViewById<CheckBox>(R.id.bubbleCheckBox
//        ).isChecked) 1 else 0
        val bubbles = 1
        // Set the data in the request form.
        requestForm.id = identifier
        requestForm.region = region
        requestForm.date = date
        if (user != null) {
          requestForm.email = user
        }
        requestForm.owner = ownersName
        requestForm.currentUsage = currentUsage
        requestForm.address = address
        requestForm.phoneNumber = ownersContact
        requestForm.thermalSensation = thermalSensation
        requestForm.bubbles = bubbles

        Log.i("Datos del formulario", requestForm.toString())

      } catch (e : Exception) {
        e.printStackTrace()
      }
    }
  }

  private fun sendRequest() {
    // Create a new request.
    val call = this.apiService.newRequest(
      requestForm.id,
      requestForm.region,
      requestForm.date,
      requestForm.email,
      requestForm.owner,
      requestForm.currentUsage,
      requestForm.address,
      requestForm.phoneNumber,
      requestForm.coordinates,
      requestForm.thermalSensation,
      requestForm.bubbles,
      requestForm.latitude,
      requestForm.longitude
    )

    // Send the request.
    call.enqueue(object : Callback<RequestResponse>{
      override fun onResponse(call: Call<RequestResponse>,
        response: Response<RequestResponse>) {
        if (response.isSuccessful) {
          // Handle the response.
          val serverResponse = response.body()
          if (serverResponse != null) {
            val status = serverResponse.status
            val errors = serverResponse.errors
            if (errors.isEmpty()) {
              if (status == "request_created") {
                Toast.makeText(
                  requireContext(),
                  "Solicitud creada correctamente.",
                  Toast.LENGTH_SHORT
                ).show()
                listener?.onFragmentEvent("FINISHED", null)
              } else {
                Toast.makeText(
                  requireContext(),
                  "Error al crear la solicitud.", Toast.LENGTH_SHORT
                ).show()
              }
            } else {
              handleServerErrors(errors)
            }
          }
        }
      }

      override fun onFailure(call: Call<RequestResponse>, t: Throwable) {
        Log.i("Error conexion", "Error: ${t.message}")
        showError("Error de conexión: ${t.message}")
      }

    })
  }

  private fun handleServerErrors(errors : List<Error>) {
    // Handle the server errors.
    for (error in errors) {
      Log.i(error.type, error.message)
    }
  }

  private fun showError(message: String) {
    // Show an error message to the user.
    Toast.makeText(requireContext(), message, Toast.LENGTH_LONG).show()
  }

  private fun openGallery() {
    // Open the gallery to select an image.
    lifecycleScope.launch {
      val intent = Intent(Intent.ACTION_PICK)
      intent.type = "image/*"
      pickImageLauncher.launch(intent)
    }
  }

  private val pickImageLauncher = registerForActivityResult(
    ActivityResultContracts.StartActivityForResult()) { result ->
      // Handle the result of the image selection.
    if (result.resultCode == Activity.RESULT_OK) {
      val data: Intent? = result.data
      if (data != null && data.data != null) {
        val imageUri = data.data
        // Handle the selected image URI.
        this.handleImageUri(imageUri)
      }
    }
  }

  private fun handleImageUri(imageUri: Uri?) {
    // Manage the URI of the selected image.
    imageUri?.let {
      this.extractLocationFromImage(it)
    }
  }

  private fun extractLocationFromImage(uri: Uri) {
    var inputStream: InputStream? = null
    try {
      val context = requireContext()
      inputStream = context.contentResolver.openInputStream(uri)
      // Extract the location information from the EXIF data of the image.
      if (inputStream != null) {
        val exifInterface = ExifInterface(inputStream)
        val latLong = FloatArray(2)
        val hasLatLong = exifInterface.getLatLong(latLong)
        if (hasLatLong) {
          val latitude = latLong[0]
          val longitude = latLong[1]
          Toast.makeText(
            requireContext(),
            "Latitud: $latitude, Longitud: $longitude",
            Toast.LENGTH_SHORT
          ).show()
          this.requestForm.latitude = "$latitude"
          this.requestForm.longitude = "$longitude"
        } else {
          Toast.makeText(
            requireContext(),
            "La imagen seleccionada no contiene información" +
              " de coordenadas.",
            Toast.LENGTH_SHORT
          ).show()
        }
      } else {
        Toast.makeText(
          requireContext(), "No se pudo abrir la imagen.",
          Toast.LENGTH_SHORT
        ).show()
      }
    } catch (e: IOException) {
      e.printStackTrace()
      Toast.makeText(
        requireContext(),
        "Error al leer los metadatos EXIF.",
        Toast.LENGTH_SHORT).show()
    } finally {
      inputStream?.close()
      // Handle the case where inputStream is null.
    }
  }

  /**
   *
   */
  @Deprecated("Deprecated in Java")
  override fun onRequestPermissionsResult(
    requestCode : Int,
    permissions : Array<out String>,
    grantResults : IntArray) {
      super.onRequestPermissionsResult(requestCode, permissions, grantResults)

      GalleryPermissionManager.handlePermissionResult(
        requestCode,
        grantResults,
        requireContext()
      )

      GPSManager.handlePermissionResult(
        requestCode,
        grantResults,
        requireContext()
      )
  }
}