package com.inii.geoterra.development.fragments

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
import androidx.lifecycle.lifecycleScope
import com.google.android.material.snackbar.Snackbar
import com.inii.geoterra.development.R
import com.inii.geoterra.development.components.OnFragmentInteractionListener
import com.inii.geoterra.development.components.services.GPSManager
import com.inii.geoterra.development.components.services.GalleryManager
import kotlinx.coroutines.launch
import java.io.IOException
import java.io.InputStream

class FormFragment : Fragment() {
  private var listener: OnFragmentInteractionListener? = null

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
      if (!GPSManager.isInitialized()) {
          GPSManager.initialize(requireContext())
      } else {
        val userLocation = GPSManager.getLastKnownLocation()
        Log.i("Coordenadas", "Latitud ${userLocation?.latitude}" +
                "y longitud ${userLocation?.longitude}")
        if (userLocation != null) {
          Snackbar.make(
            requireView(),
            "Latitud ${userLocation.latitude} y longitud ${userLocation.longitude}",
            Snackbar.LENGTH_LONG
          ).show()
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

    sendButton.setOnClickListener {
      listener?.onFragmentFinished()
    }

    return rootView
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
          Snackbar.make(
            requireView(),
            "Latitud $latitude y longitud $longitude",
            Snackbar.LENGTH_LONG
          ).show()

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