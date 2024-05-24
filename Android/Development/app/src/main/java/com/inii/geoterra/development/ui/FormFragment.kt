package com.inii.geoterra.development.ui

import android.Manifest
import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.media.ExifInterface
import android.net.Uri
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import com.inii.geoterra.development.Components.ImageServices
import com.inii.geoterra.development.Components.LocationService
import com.inii.geoterra.development.R
import kotlinx.coroutines.launch
import java.io.IOException
import java.io.InputStream

// TODO: Rename parameter arguments, choose names that match
// the fragment initialization parameters, e.g. ARG_ITEM_NUMBER
private const val ARG_PARAM1 = "param1"
private const val ARG_PARAM2 = "param2"

class FormFragment : Fragment() {
  // TODO: Rename and change types of parameters
  private var param1 : String? = null
  private var param2 : String? = null

  private lateinit var locationService : LocationService
  private lateinit var imageServices : ImageServices
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
    locationService = LocationService()
    imageServices = ImageServices()

    val locationButton = rootView.findViewById<Button>(R.id.userLocationButton)
    val imageLocation = rootView.findViewById<Button>(R.id.locationImageButton)

    locationButton.setOnClickListener {
      if (checkLocationPermission()) {
        requestLocationPermission()
      } else {
        locationService.setUserLocationPermissions(true)
        lifecycleScope.launch {
          val location = locationService.getUserLocation(requireContext())
          Toast.makeText(requireContext(), "Latitud ${location?.latitude}  y longitud ${location?.longitude}", Toast.LENGTH_SHORT).show()
        }
      }
    }

    imageLocation.setOnClickListener {
      if (checkGalleryPermissions()) {
        requestGalleryPermission()
      } else {
        imageServices.setGalleryAccess(true)
        openGallery()
      }
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
      var selectedImageUri = it
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
          println("Latitud: $latitude, Longitud: $longitude")
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

  private fun checkGalleryPermissions() : Boolean {
    return ContextCompat.checkSelfPermission(requireContext(), Manifest.permission.READ_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED
  }

  private fun checkLocationPermission() : Boolean {
    return ContextCompat.checkSelfPermission(requireContext(), Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED
            || ContextCompat.checkSelfPermission(requireContext(), Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED
            || ContextCompat.checkSelfPermission(requireContext(), Manifest.permission.INTERNET) != PackageManager.PERMISSION_GRANTED
            || ContextCompat.checkSelfPermission(requireContext(), Manifest.permission.ACCESS_NETWORK_STATE) != PackageManager.PERMISSION_GRANTED
  }


  private fun requestGalleryPermission() {
    if (ActivityCompat.shouldShowRequestPermissionRationale(requireActivity(), Manifest.permission.READ_MEDIA_IMAGES)) {
      Toast.makeText(requireContext(), "Esta aplicación requiere los permisos de galeria si quiere utilizar imagenes para la ubicacion. Por favor activelos en ajustes de la aplicacion.", Toast.LENGTH_SHORT).show()
    } else {
      ActivityCompat.requestPermissions(requireActivity(), arrayOf(Manifest.permission.READ_EXTERNAL_STORAGE), 100)
    }
  }

  /**
   *
   */
  private fun requestLocationPermission() {
    if (ActivityCompat.shouldShowRequestPermissionRationale(requireActivity(), Manifest.permission.ACCESS_FINE_LOCATION)
      || ActivityCompat.shouldShowRequestPermissionRationale(requireActivity(), Manifest.permission.ACCESS_COARSE_LOCATION)
      || ActivityCompat.shouldShowRequestPermissionRationale(requireActivity(), Manifest.permission.INTERNET)
      || ActivityCompat.shouldShowRequestPermissionRationale(requireActivity(), Manifest.permission.ACCESS_NETWORK_STATE)) {
      // Decirle al usuario que necesia los permisos para funcionar la app y ahora el debe de activarlos el mismo
      Toast.makeText(requireContext(), "Esta aplicación requiere los permisos de Internet y GPS. Por favor actívelos en ajustes de la aplicacion.", Toast.LENGTH_SHORT).show()
    } else {
      // No se han rechado los permisos y podemos activarlos por la ventana
      ActivityCompat.requestPermissions(requireActivity(), arrayOf(
        Manifest.permission.ACCESS_FINE_LOCATION,
        Manifest.permission.ACCESS_COARSE_LOCATION), 777)

      ActivityCompat.requestPermissions(requireActivity(), arrayOf(
        Manifest.permission.INTERNET,
        Manifest.permission.ACCESS_NETWORK_STATE), 200)
    }
  }

  /**
   *
   */
  override fun onRequestPermissionsResult(requestCode : Int,
                                          permissions : Array<out String>,
                                          grantResults : IntArray) {
    super.onRequestPermissionsResult(requestCode, permissions, grantResults)
    // TODO : Cambiar la logica para que solo maneje cuando no se aceptaron por primera vez
    if (requestCode == 777) {
      if (grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED
        && grantResults[1] == PackageManager.PERMISSION_GRANTED) {
        locationService.setUserLocationPermissions(true)
        Toast.makeText(requireContext(), "entraaa", Toast.LENGTH_SHORT).show()
      } else {
        // el permiso no ha sido aceptado POR PRIMERA VEZ
        locationService.setUserLocationPermissions(false)
        Toast.makeText(requireContext(), "Por favor considere conceder los permisos a la aplicacion", Toast.LENGTH_SHORT).show()
      }

    } else if (requestCode == 200) {
      if (grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED
        && grantResults[1] == PackageManager.PERMISSION_GRANTED) {
        Toast.makeText(requireContext(), "entraaa2222", Toast.LENGTH_SHORT).show()
      }
    } else if (requestCode == 100) {
      if (grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
        imageServices.setGalleryAccess(true)
      } else {
        imageServices.setGalleryAccess(false)
        Toast.makeText(requireContext(), "Por favor considere conceder de galeria a la aplicacion", Toast.LENGTH_SHORT).show()
      }
    }

  }

}