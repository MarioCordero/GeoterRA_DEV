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
import androidx.activity.result.contract.ActivityResultContracts
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import com.google.android.material.slider.Slider
import com.inii.geoterra.development.R
import com.inii.geoterra.development.interfaces.FragmentListener
import com.inii.geoterra.development.api.Error
import com.inii.geoterra.development.api.RequestForm
import com.inii.geoterra.development.api.RequestResponse
import com.inii.geoterra.development.api.RetrofitClient
import com.inii.geoterra.development.device.GPSManager
import com.inii.geoterra.development.managers.GalleryPermissionManager
import com.inii.geoterra.development.managers.SessionManager
import kotlinx.coroutines.launch
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import java.io.IOException
import java.io.InputStream
import java.util.Locale

class FormFragment : Fragment() {
  private lateinit var binding : View
  private lateinit var requestForm : RequestForm
  private lateinit var galleryPermissionManager : GalleryPermissionManager
  private var listener : FragmentListener? = null

  override fun onCreateView(inflater : LayoutInflater,
                            container : ViewGroup?,
                            savedInstanceState : Bundle?)
  : View {
     this.binding = inflater.inflate(
       R.layout.fragment_form, container, false
     )
    // Inflate the layout for this fragment
    // Creates an object that manage the location requests.
    this.requestForm = RequestForm()
    this.galleryPermissionManager = GalleryPermissionManager(requireContext())
    val locationButton =
      this.binding.findViewById<Button>(R.id.userLocationButton)
    val imageButton =
      this.binding.findViewById<Button>(R.id.locationImageButton)
    val sendButton = this.binding.findViewById<Button>(R.id.sendRequestButton)
    val dateText = this.binding.findViewById<TextView>(R.id.dateText)
    val temperatureSlider =
      this.binding.findViewById<Slider>(R.id.temperatureSlider)
    val sliderLabel = this.binding.findViewById<TextView>(R.id.sliderLabel)

    temperatureSlider.addOnChangeListener { _, value, _ ->
      // Update the label text GRAVITY based on the selected value
      val layoutParams = sliderLabel.layoutParams as LinearLayout.LayoutParams
      layoutParams.gravity = when (value.toInt()) {
        1 -> Gravity.START
        2 -> Gravity.CENTER
        3 -> Gravity.END
        else -> Gravity.START
      }
      sliderLabel.layoutParams = layoutParams

      // Update the label text
      val label = when (value.toInt()) {
        1 -> "Frío"
        2 -> "Tibio"
        3 -> "Caliente"
        else -> ""
      }
      sliderLabel.text = label
    }

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
      Log.i(
        "GalleryManager",
        "isInitialize: ${this.galleryPermissionManager.isInitialized()}"
      )
      if (!this.galleryPermissionManager.isInitialized()) {
        // Try to ask for the gallery permission.
        this.galleryPermissionManager.requestGalleryPermission(
          requireActivity()
        )
      } else {
        // Open the gallery.
        this.openGallery()
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

  override fun onAttach(context: Context) {
    super.onAttach(context)
    if (context is FragmentListener) {
      this.listener = context
    }
  }

  override fun onDetach() {
    super.onDetach()
    this.listener = null
  }

  private fun getFormData() {
    lifecycleScope.launch {
      try {
        val region = "Guanacaste"
        val date = binding.findViewById<TextView>(
          R.id.dateText).text.toString()
        val user = SessionManager.getUserEmail()
        val zoneOwner =
          binding.findViewById<EditText>(R.id.zoneOwnerTxtInput).text.toString()
        val currentUsage = binding.findViewById<EditText>(
          R.id.currentUsageTxtInput).text.toString()
        val address = binding.findViewById<EditText>(
          R.id.indicationsTxtInput).text.toString()
        val phoneNumber = binding.findViewById<EditText>(
          R.id.phoneNumberTxtInput).text.toString()
        val thermalSensation = binding.findViewById<Slider>(
          R.id.temperatureSlider).value.toInt()
        val bubbles = if (binding.findViewById<CheckBox>(
            R.id.bubbleCheckBox).isChecked) 1 else 0
        // Set the data in the request form.
        requestForm.region = region
        requestForm.date = date
        if (user != null) {
          requestForm.email = user
        }
        requestForm.owner = zoneOwner
        requestForm.currentUsage = currentUsage
        requestForm.address = address
        requestForm.phoneNumber = phoneNumber
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
    val apiService = RetrofitClient.getAPIService()
    val call = apiService.newRequest(
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
                listener?.onFragmentEvent("FINISHED")
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
  override fun onRequestPermissionsResult(requestCode : Int,
                                          permissions : Array<out String>,
                                          grantResults : IntArray) {
      super.onRequestPermissionsResult(requestCode, permissions, grantResults)
      this.galleryPermissionManager.handlePermissionResult(
        requestCode, grantResults
      )
      GPSManager.handlePermissionResult(requestCode, grantResults, requireContext())
  }
}