package com.inii.geoterra.development.ui

import GPSManager
import GalleryManager
import android.app.Activity
import android.content.Intent
import android.media.ExifInterface
import android.net.Uri
import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.fragment.app.Fragment
import com.inii.geoterra.development.Components.OnFragmentInteractionListener
import com.inii.geoterra.development.R
import java.io.IOException
import java.io.InputStream

// TODO: Rename parameter arguments, choose names that match
// the fragment initialization parameters, e.g. ARG_ITEM_NUMBER
private const val ARG_PARAM1 = "param1"
private const val ARG_PARAM2 = "param2"

private var listener: OnFragmentInteractionListener? = null


class FormFragment : Fragment() {
  // TODO: Rename and change types of parameters
  private var param1 : String? = null
  private var param2 : String? = null

  override fun onCreate(savedInstanceState : Bundle?) {
    super.onCreate(savedInstanceState)
    arguments?.let {
      param1 = it.getString(ARG_PARAM1)
      param2 = it.getString(ARG_PARAM2)
    }
  }

  override fun onCreateView(inflater : LayoutInflater,
                            container : ViewGroup?,
                            savedInstanceState : Bundle?)
  : View? {
    val rootView = inflater.inflate(R.layout.fragment_form, container, false)
    // Inflate the layout for this fragment
    // Creates an object that manage the location requests.

    val locationButton = rootView.findViewById<Button>(R.id.userLocationButton)
    val imageButton = rootView.findViewById<Button>(R.id.locationImageButton)
    val sendButton = rootView.findViewById<Button>(R.id.sendRequestButton)

    locationButton.setOnClickListener {
      if (!GPSManager.isInitialiazed()) {
        GPSManager.initialize(requireContext())
      }
      val userLocation = GPSManager.getLastKnownLocation()
      Log.i("Coordenadas", "Latitud ${userLocation?.latitude}  y longitud ${userLocation?.longitude}")
    }

    imageButton.setOnClickListener {
      if (!GalleryManager.isInitialize()) {
        GalleryManager.initialize(requireContext())
      }
      openGallery()
    }

    sendButton.setOnClickListener {
      val listener = activity as? OnFragmentInteractionListener
      listener?.onFragmentFinished()
    }

    return rootView
  }

  companion object {
    /**
     * Use this factory method to create a new instance of
     * this fragment using the provided parameters.
     *
     * @param param1 Parameter 1.
     * @param param2 Parameter 2.
     * @return A new instance of fragment FormFragment.
     */
    // TODO: Rename and change types and number of parameters
    @JvmStatic
    fun newInstance(param1 : String, param2 : String) = FormFragment().apply {
      arguments = Bundle().apply {
        putString(ARG_PARAM1, param1)
        putString(ARG_PARAM2, param2)
      }
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

  private fun openGallery() {
    val intent = Intent(Intent.ACTION_PICK)
    intent.type = "image/*"
    pickImageLauncher.launch(intent)
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
        } else {
          println("No se encontró información de ubicación en la imagen.")
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