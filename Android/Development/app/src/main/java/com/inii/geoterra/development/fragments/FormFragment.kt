package com.inii.geoterra.development.fragments

import android.app.Activity
import android.app.DatePickerDialog
import android.content.Intent
import android.icu.text.SimpleDateFormat
import android.icu.util.Calendar
import android.media.ExifInterface
import android.net.Uri
import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.CheckBox
import android.widget.EditText
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import com.inii.geoterra.development.R
import com.inii.geoterra.development.components.OnFragmentInteractionListener
import com.inii.geoterra.development.components.api.Error
import com.inii.geoterra.development.components.api.RequestForm
import com.inii.geoterra.development.components.api.RequestResponse
import com.inii.geoterra.development.components.api.RetrofitClient
import com.inii.geoterra.development.components.services.GPSManager
import com.inii.geoterra.development.components.services.GalleryManager
import kotlinx.coroutines.launch
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import java.io.IOException
import java.io.InputStream
import java.util.Locale

class FormFragment : Fragment() {
  private lateinit var rootView : View
  private var listener : OnFragmentInteractionListener? = null
  private lateinit var requestForm : RequestForm

  override fun onCreateView(inflater : LayoutInflater,
                            container : ViewGroup?,
                            savedInstanceState : Bundle?)
  : View {
     rootView = inflater.inflate(R.layout.fragment_form, container, false)
    // Inflate the layout for this fragment
    // Creates an object that manage the location requests.
    listener = activity as? OnFragmentInteractionListener
    requestForm = RequestForm("", "", "", "", "", "", 0, "", 0, 0)

    val locationButton = rootView.findViewById<Button>(R.id.userLocationButton)
    val imageButton = rootView.findViewById<Button>(R.id.locationImageButton)
    val sendButton = rootView.findViewById<Button>(R.id.sendRequestButton)
    val dateEditText = rootView.findViewById<EditText>(R.id.dateTxtInput)

    // Crear un calendario con la fecha actual
    val calendar = Calendar.getInstance()

    // Definir un formato de fecha
    val dateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())

    // Configurar el DatePickerDialog
    val dateSetListener = DatePickerDialog.OnDateSetListener { _, year, month, dayOfMonth ->
      calendar.set(Calendar.YEAR, year)
      calendar.set(Calendar.MONTH, month)
      calendar.set(Calendar.DAY_OF_MONTH, dayOfMonth)
      // Formatear la fecha seleccionada y mostrarla en el EditText
      dateEditText.setText(dateFormat.format(calendar.time))
    }

    locationButton.setOnClickListener {
      if (!GPSManager.isInitialized()) {
          GPSManager.initialize(requireContext())
      } else {
        val userLocation = GPSManager.getLastKnownLocation()
        Log.i("Coordenadas", "Latitud ${userLocation?.latitude}" +
                "y longitud ${userLocation?.longitude}")
        if (userLocation != null) {
          Toast.makeText(requireContext(), "Latitud ${userLocation.latitude} y longitud ${userLocation.longitude}", Toast.LENGTH_SHORT).show()
          requestForm.coordinates = "${userLocation.latitude}, ${userLocation.longitude}"
          Log.i("Coordenadas", requestForm.coordinates)
        }
      }
    }

    imageButton.setOnClickListener {
      Log.i("GalleryManager", "isInitialize: ${GalleryManager.isInitialize()}")
      if (!GalleryManager.isInitialize()) {
        GalleryManager.initialize(requireContext())
      } else {
        openGallery()
      }
    }

    dateEditText.setOnClickListener {
      DatePickerDialog(
        requireContext(),
        dateSetListener,
        calendar.get(Calendar.YEAR),
        calendar.get(Calendar.MONTH),
        calendar.get(Calendar.DAY_OF_MONTH)
      ).show()
    }

    sendButton.setOnClickListener {
      getFormData()
      sendRequest()
      listener?.onFragmentFinished()
    }

    return rootView
  }

  private fun getFormData() {
    lifecycleScope.launch {
      try {
        val name = rootView.findViewById<EditText>(R.id.nameTxtInput).text.toString()
        val phoneNumber = rootView.findViewById<EditText>(R.id.phoneNumberTxtInput).text.toString().toInt()
        val date = rootView.findViewById<EditText>(R.id.dateTxtInput).text.toString()
        val thermalSensation = rootView.findViewById<EditText>(R.id.temperatureSlider).text.toString().toInt()
        // TODO : CORREGIR EL DE LA TEMPERATURA PARA QUE COINCIDA CON EL SLIDER.
        val zoneOwner = rootView.findViewById<EditText>(R.id.zoneOwnerTxtInput).text.toString()
        val currentUsage = rootView.findViewById<EditText>(R.id.currentUsageTxtInput).text.toString()
        val address = rootView.findViewById<EditText>(R.id.indicationsTxtInput).text.toString()
        val bubbles = if (rootView.findViewById<CheckBox>(R.id.bubbleCheckBox).isChecked) 1 else 0

        requestForm.pointID = name
        requestForm.contactNumber = phoneNumber
        requestForm.date = date
        requestForm.thermalSensation = thermalSensation
        requestForm.owner = zoneOwner
        requestForm.currentUsage = currentUsage
        requestForm.address = address
        requestForm.bubbles = bubbles

        Log.i("Datos del formulario", requestForm.toString())

      } catch (e : Exception) {
          e.printStackTrace()
      }
    }
  }

  private fun sendRequest() {
    val apiService = RetrofitClient.getAPIService()
    val call = apiService.newRequest(requestForm.pointID, requestForm.region, requestForm.date,
      requestForm.owner, requestForm.currentUsage, requestForm.address, requestForm.contactNumber,
      requestForm.coordinates ,requestForm.thermalSensation, requestForm.bubbles)

    call.enqueue(object : Callback<RequestResponse>{
      override fun onResponse(call: Call<RequestResponse>, response: Response<RequestResponse>) {
        if (response.isSuccessful) {
          val serverResponse = response.body()
          if (serverResponse != null) {
            val status = serverResponse.status
            val errors = serverResponse.errors
            if (errors.isEmpty()) {
              if (status == "request_created") {
                Toast.makeText(requireContext(), "Solicitud creada correctamente.", Toast.LENGTH_SHORT).show()
              } else {
                Toast.makeText(requireContext(), "Error al crear la solicitud.", Toast.LENGTH_SHORT).show()
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
    // Verifica si la lista de errores no es nula y no está vacía
    for (error in errors) {
      Log.i(error.type, error.message)
    }
  }

  private fun showError(message: String) {
    // Se le muestra el mensaje de error al usuario.
    Toast.makeText(requireContext(), message, Toast.LENGTH_LONG).show()
  }

  private fun openGallery() {
    lifecycleScope.launch {
      val intent = Intent(Intent.ACTION_PICK)
      intent.type = "image/*"
      pickImageLauncher.launch(intent)
    }
  }

  private val pickImageLauncher = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
    if (result.resultCode == Activity.RESULT_OK) {
      val data: Intent? = result.data
      if (data != null && data.data != null) {
        val imageUri = data.data
        // Aquí almacenas el URI de la imagen para uso posterior
        handleImageUri(imageUri)
      }
    }
  }

  private fun handleImageUri(imageUri: Uri?) {
    // Guarda el URI para uso posterior
    // Puedes almacenarlo en una variable, base de datos, o enviarlo a otra parte de tu aplicación
    imageUri?.let {
      // Ejemplo de almacenamiento en una variable de instancia
      extractLocationFromImage(it)
    }
  }


  private fun extractLocationFromImage(uri: Uri) {
    var inputStream: InputStream? = null
    try {
      val context = requireContext()
      inputStream = context.contentResolver.openInputStream(uri)
      if (inputStream != null) {
        val exifInterface = ExifInterface(inputStream)
        val latLong = FloatArray(2)
        val hasLatLong = exifInterface.getLatLong(latLong)
        if (hasLatLong) {
          val latitude = latLong[0]
          val longitude = latLong[1]
          Log.i("Image Coor", "Latitud: $latitude, Longitud: $longitude")
          Toast.makeText(requireContext(), "Latitud: $latitude, Longitud: $longitude", Toast.LENGTH_SHORT).show()
          requestForm.coordinates = "$latitude, $longitude"
        } else {
          Toast.makeText(requireContext(), "La imagen seleccionada no contiene información de coordenadas.", Toast.LENGTH_SHORT).show()
        }
      } else {
        Toast.makeText(requireContext(), "No se pudo abrir la imagen.", Toast.LENGTH_SHORT).show()
      }
    } catch (e: IOException) {
      e.printStackTrace()
      Toast.makeText(requireContext(), "Error al leer los metadatos EXIF.", Toast.LENGTH_SHORT).show()
    } finally {
      inputStream?.close()
    }
  }

  private fun isValidDate(date: String): Boolean {
    val dateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
    return try {
      dateFormat.isLenient = false
      dateFormat.parse(date)
      true
    } catch (e: Exception) {
      false
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
      GalleryManager.handlePermissionResult(requestCode, grantResults, requireContext())
      GPSManager.handlePermissionResult(requestCode, grantResults, requireContext())
  }
}