package com.inii.geoterra.development.ui.requests

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
import android.widget.ViewSwitcher
import androidx.activity.result.contract.ActivityResultContracts
import com.google.android.material.button.MaterialButton
import com.google.android.material.button.MaterialButtonToggleGroup
import com.google.android.material.textfield.TextInputEditText
import com.google.android.material.textfield.TextInputLayout
import com.inii.geoterra.development.R
import com.inii.geoterra.development.api.AnalysisRequestPayload
import com.inii.geoterra.development.api.Error
import com.inii.geoterra.development.api.RequestResponse
import com.inii.geoterra.development.device.GPSManager
import com.inii.geoterra.development.interfaces.PageFragment
import com.inii.geoterra.development.managers.GalleryPermissionManager
import com.inii.geoterra.development.managers.SessionManager
import com.inii.geoterra.development.ui.elements.SpringForm
import com.inii.geoterra.development.ui.elements.TerrainForm
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import java.io.IOException
import java.io.InputStream
import java.util.Locale

/**
 * Fragment for handling terrain and spring request forms.
 *
 * Manages user input for creating new terrain or spring requests, including:
 * - Form selection between terrain and spring types
 * - Location capture via GPS or image EXIF data
 * - Date selection
 * - Form data submission to the API
 * - Image selection for coordinate extraction
 *
 * @property requestForm Data container for request information
 * @property terrainForm Custom view for terrain-specific inputs
 * @property springForm Custom view for spring-specific inputs
 * @property viewSwitcher Container for switching between terrain and spring forms
 * @property terrainTypeButtonGroup Toggle group for selecting request type
 * @property landTypeButton Button for selecting terrain form
 * @property springTypeButton Button for selecting spring form
 * @property locationButton Button for capturing GPS coordinates
 * @property imageButton Button for selecting image with EXIF coordinates
 * @property sendButton Button for submitting the form
 * @property identifierInputLayout TextInputEditText for request identifier
 * @property dateInputLayout TextInputEditText for request date
 * @property dateInput TextInputEditText displaying and selecting the request date
 * @property identifierInput TextInputEditText for request identifier
 * @property ownersNameInput TextInputEditText for owner's name
 * @property currentUsageInput TextInputEditText for current usage information
 * @property detailsInput TextInputEditText for location address details
 * @property ownersContactInput TextInputEditText for owner contact information
 * @property bubbleCheckBox CheckBox for bubble presence indication
 * @property calendar Calendar instance for date management
 * @property dateFormat Date formatter for display
 * @property dateSetListener Listener for date selection events
 * @property pickImageLauncher Activity launcher for image selection
 */
class FormFragment : PageFragment() {
  /** Data container for request information */
  private lateinit var AnalysisRequestPayload : AnalysisRequestPayload

  /** Custom view for terrain-specific inputs */
  private lateinit var terrainForm: TerrainForm

  /** Custom view for spring-specific inputs */
  private lateinit var springForm: SpringForm

  /** Container for switching between terrain and spring forms */
  private lateinit var viewSwitcher: ViewSwitcher

  /** Toggle group for selecting request type */
  private lateinit var terrainTypeButtonGroup: MaterialButtonToggleGroup

  /** Button for selecting terrain form */
  private lateinit var landTypeButton: MaterialButton

  /** Button for selecting spring form */
  private lateinit var springTypeButton: MaterialButton

  /** Button for capturing GPS coordinates */
  private lateinit var locationButton: MaterialButton

  /** Button for selecting image with EXIF coordinates */
  private lateinit var imageButton: MaterialButton

  /** Button for submitting the form */
  private lateinit var sendButton: Button

  /** TextInputLayout for request identifier */
  private lateinit var identifierInputLayout: TextInputLayout

  /** TextInputLayout for request date */
  private lateinit var dateInputLayout: TextInputLayout

  /** TextInputEditText displaying and selecting the request date */
  private lateinit var dateInput: TextInputEditText

  /** EditText for request identifier */
  private lateinit var identifierInput: TextInputEditText

  /** TextInputEditText for owner's name */
  private lateinit var ownersNameInput: TextInputEditText

  /** TextInputEditText for current usage information */
  private lateinit var currentUsageInput: TextInputEditText

  /** TextInputEditText for location address details */
  private lateinit var detailsInput: TextInputEditText

  /** TextInputEditText for owner contact information */
  private lateinit var ownersContactInput: TextInputEditText

  /** CheckBox for bubble presence indication */
  private lateinit var bubbleCheckBox: CheckBox

  /** Calendar instance for date management */
  private val calendar = Calendar.getInstance()

  /** Date formatter for display */
  private val dateFormat = SimpleDateFormat(
    "yyyy-MM-dd", Locale.getDefault()
  )

  /** Listener for date selection events */
  private val dateSetListener = DatePickerDialog.OnDateSetListener { _,
    year, month, dayOfMonth ->
    calendar.set(Calendar.YEAR, year)
    calendar.set(Calendar.MONTH, month)
    calendar.set(Calendar.DAY_OF_MONTH, dayOfMonth)
    dateInput.setText(dateFormat.format(calendar.time))
  }

  /** Activity launcher for image selection */
  private val pickImageLauncher = registerForActivityResult(
    ActivityResultContracts.StartActivityForResult()
  ) { result ->
    // Checks if the result is OK.
    if (result.resultCode == Activity.RESULT_OK) {
      result.data?.data?.let { uri ->
        // Handle the selected image URI.
        handleImageUri(uri)
      }
    }
  }

  /**
   * Creates the fragment view hierarchy.
   *
   * @param inflater LayoutInflater to inflate views
   * @param container Parent view group for the fragment
   * @param savedInstanceState Previously saved fragment state
   * @return Inflated view hierarchy for the fragment
   */
  override fun onCreateView(
    inflater : LayoutInflater,
    container : ViewGroup?,
    savedInstanceState : Bundle?)
  : View {
    this.binding = inflater.inflate(
      R.layout.fragment_form, container, false
    )
    this.initViews()
    this.initFormObjects()
    this.setupUIComponents()
    return binding
  }

  /**
   * Initializes all view references.
   */
  private fun initViews() {
    this.viewSwitcher = binding.findViewById(R.id.form_container)
    this.terrainTypeButtonGroup = binding.findViewById(
      R.id.terrain_type_button_group
    )
    this.identifierInputLayout = binding.findViewById(R.id.identifier_input_layout)
    this.dateInputLayout = binding.findViewById(R.id.date_input_layout)
    this.landTypeButton = binding.findViewById(R.id.land_type_button)
    this.springTypeButton = binding.findViewById(R.id.spring_type_button)
    this.locationButton = binding.findViewById(R.id.gps_coordinates_button)
    this.imageButton = binding.findViewById(R.id.image_coordinates_button)
    this.sendButton = binding.findViewById(R.id.sendRequestButton)
    this.dateInput = binding.findViewById(R.id.date_input)
    this.identifierInput = binding.findViewById(R.id.identifier_input)
    this.ownersNameInput = binding.findViewById(R.id.owners_name_input)
    this.currentUsageInput = binding.findViewById(R.id.actual_use_input)
    this.detailsInput = binding.findViewById(R.id.details_input)
    this.ownersContactInput = binding.findViewById(R.id.owner_contact_input)
  }

  /**
   * Initializes form objects and adds them to the view switcher.
   */
  private fun initFormObjects() {
    this.AnalysisRequestPayload = AnalysisRequestPayload()
    this.terrainForm = TerrainForm(requireContext())
    this.springForm = SpringForm(requireContext())

    this.viewSwitcher.addView(terrainForm)
    this.viewSwitcher.addView(springForm)
  }

  /**
   * Configures all UI components and their listeners.
   */
  private fun setupUIComponents() {
    this.setupTerrainTypeToggle()
    this.setupLocationButton()
    this.setupImageButton()
    this.setupDatePicker()
    this.setupSendButton()
  }

  /**
   * Sets up the terrain type toggle group listener.
   */
  private fun setupTerrainTypeToggle() {
    this.terrainTypeButtonGroup.addOnButtonCheckedListener { _,
      checkedId, isChecked ->
      if (isChecked) {
        when (checkedId) {
          R.id.land_type_button -> viewSwitcherListener(0)
          R.id.spring_type_button -> viewSwitcherListener(1)
        }
      }
    }

    // Set initial state
    this.locationButton.isChecked = true
    this.imageButton.isChecked = false
  }

  /**
   * Sets up the location button click listener.
   */
  private fun setupLocationButton() {
    this.locationButton.setOnClickListener {
      this.handleLocationRequest()
    }
  }

  /**
   * Handles location request logic.
   */
  private fun handleLocationRequest() {
    if (!GPSManager.isInitialized()) {
      GPSManager.initialize(requireContext())
    } else {
      val userLocation = GPSManager.getLastKnownLocation()
      Log.i(
        "Coordinates",
        "Lat ${userLocation?.latitude}, Lon ${userLocation?.longitude}"
      )

      userLocation?.let {
        this.showToast("Lat ${it.latitude}, Lon ${it.longitude}")
        AnalysisRequestPayload.apply {
          latitude = "${it.latitude}"
          longitude = "${it.longitude}"
          coordinates = "${it.latitude}, ${it.longitude}"
        }
        Log.i(
          "Coordinates",
          "${AnalysisRequestPayload.latitude}" +
            " ${AnalysisRequestPayload.longitude}"
        )
      }
    }
  }

  /**
   * Sets up the image button click listener.
   */
  private fun setupImageButton() {
    imageButton.setOnClickListener {
      handleImageSelection()
    }
  }

  /**
   * Handles image selection logic.
   */
  private fun handleImageSelection() {
    if (!GalleryPermissionManager.isInitialized()) {
      if (!shouldShowRequestPermissionRationale(
          GalleryPermissionManager.requiredPermission
      )) {
        showToast(
          "Activate gallery permission in Settings",
          Toast.LENGTH_LONG
        )
      } else {
        GalleryPermissionManager.initialize(this)
      }
    } else {
      openGallery()
    }
  }

  /**
   * Sets up the date picker functionality.
   */
  private fun setupDatePicker() {
    dateInput.setText(dateFormat.format(calendar.time))
    dateInput.setOnClickListener {
      showDatePicker()
    }
  }

  /**
   * Shows the date picker dialog.
   */
  private fun showDatePicker() {
    DatePickerDialog(
      requireContext(),
      android.R.style.Theme_Material_Light_Dialog,
      dateSetListener,
      calendar.get(Calendar.YEAR),
      calendar.get(Calendar.MONTH),
      calendar.get(Calendar.DAY_OF_MONTH)
    ).show()
  }

  /**
   * Sets up the send button click listener.
   */
  private fun setupSendButton() {
    this.sendButton.setOnClickListener {
      if (getFormData()) {
        sendRequest()
      }
    }
  }

  /**
   * Shows the specified form in the view switcher.
   *
   * @param index Index of the form to show (0 for terrain, 1 for spring)
   */
  private fun viewSwitcherListener(index: Int) {
    val viewSwitcher = binding.findViewById<ViewSwitcher>(R.id.form_container)
    if (index >= 0 && index < viewSwitcher.childCount) {
      while (viewSwitcher.displayedChild != index) {
        viewSwitcher.showNext()
      }
    }
  }

  /**
   * Collects form data and populates the request form object.
   */
  private fun getFormData(): Boolean {
    var isValid = true

    identifierInputLayout.error = null
    dateInputLayout.error = null

    if (identifierInput.text.toString().isBlank()) {
      identifierInputLayout.error = "Ingrese un identificador"
      isValid = false
    }

    if (dateInput.text.toString().isBlank()) {
      dateInputLayout.error = "Ingrese una fecha"
      isValid = false
    }

    if (AnalysisRequestPayload.latitude.isBlank()
      || AnalysisRequestPayload.longitude.isBlank()) {
      showToast(
        "Seleccione un método de captura de coordenadas",
        Toast.LENGTH_SHORT
      )
      isValid = false
    }

    if (!isValid) return false

    try {
      if (viewSwitcher.currentView == terrainForm) {
        AnalysisRequestPayload.thermalSensation =
          terrainForm.getThermalSensation().toInt()
      } else {
        AnalysisRequestPayload.bubbles = springForm.getBubbling().toInt()
      }

      AnalysisRequestPayload.apply {
        id = identifierInput.text.toString()
        region = "Guanacaste"
        date = dateInput.text.toString()
        email = SessionManager.getUserEmail().toString()
        owner = ownersNameInput.text.toString()
        currentUsage = currentUsageInput.text.toString()
        details = detailsInput.text.toString()
        ownerContact = ownersContactInput.text.toString()
        thermalSensation = 1 // Placeholder
        bubbles = if (bubbleCheckBox.isChecked) 1 else 0
      }

      Log.i("FormData", AnalysisRequestPayload.toString())
    } catch (e: Exception) {
      Log.e("FormData", "Error getting form data", e)
      return false
    }

    return true
  }


  /**
   * Sends the form data to the server.
   */
  private fun sendRequest() {
    this.apiService.newRequest(
      AnalysisRequestPayload.id,
      AnalysisRequestPayload.region,
      AnalysisRequestPayload.date,
      AnalysisRequestPayload.email,
      AnalysisRequestPayload.owner,
      AnalysisRequestPayload.currentUsage,
      AnalysisRequestPayload.details,
      AnalysisRequestPayload.ownerContact,
      AnalysisRequestPayload.coordinates,
      AnalysisRequestPayload.thermalSensation,
      AnalysisRequestPayload.bubbles,
      AnalysisRequestPayload.latitude,
      AnalysisRequestPayload.longitude
    ).enqueue(object : Callback<RequestResponse> {
      /**
       * Handles successful API response.
       */
      override fun onResponse(call: Call<RequestResponse>,
        response: Response<RequestResponse>) {
        if (response.isSuccessful) {
          handleRequestResponse(response.body())
        } else {
          showToast("Error creating request", Toast.LENGTH_SHORT)
        }
      }

      /**
       * Handles network failures.
       */
      override fun onFailure(call: Call<RequestResponse>, t: Throwable) {
        Log.e("ConnectionError", "Error: ${t.message}")
        showToast("Connection error: ${t.message}")
      }
    })
  }

  /**
   * Handles the server response after form submission.
   *
   * @param response Server response object
   */
  private fun handleRequestResponse(response: RequestResponse?) {
    response?.let {
      if (it.errors.isEmpty()) {
        when (it.status) {
          "request_created" -> {
            this.showToast(
              "Request created successfully",
              Toast.LENGTH_SHORT
            )
            listener?.onFragmentEvent("FINISHED", null)
          }
          else -> this.showToast(
            "Error creating request",
            Toast.LENGTH_SHORT
          )
        }
      } else {
        handleServerErrors(it.errors)
      }
    }
  }

  /**
   * Handles server validation errors.
   *
   * @param errors List of error objects from server
   */
  private fun handleServerErrors(errors: List<Error>) {
    for (error in errors) {
      Log.e(error.type, error.message)
    }
  }

  /**
   * Opens the gallery for image selection.
   */
  private fun openGallery() {
    val intent = Intent(Intent.ACTION_PICK).apply {
      type = "image/*"
    }
    this.pickImageLauncher.launch(intent)
  }

  /**
   * Processes the selected image URI.
   *
   * @param imageUri URI of the selected image
   */
  private fun handleImageUri(imageUri: Uri) {
    this.extractLocationFromImage(imageUri)
  }

  /**
   * Extracts location data from image EXIF metadata.
   *
   * @param uri URI of the image to process
   */
  private fun extractLocationFromImage(uri: Uri) {
    // Gets the input stream from the URI
    var inputStream: InputStream? = null
    try {
      // Opens the input stream
      inputStream = requireContext().contentResolver.openInputStream(uri)
      inputStream?.let {
        // Creates an ExifInterface instance
        val exifInterface = ExifInterface(it)
        // Creates a float array to store the latitude and longitude
        val latLong = FloatArray(2)
        // Checks if the image has location data
        if (exifInterface.getLatLong(latLong)) {
          // Extracts the latitude and longitude
          val latitude = latLong[0]
          val longitude = latLong[1]
          showToast(
            "Lat: $latitude, Lon: $longitude",
            Toast.LENGTH_SHORT
          )

          AnalysisRequestPayload.apply {
            this.latitude = "$latitude"
            this.longitude = "$longitude"
          }
        } else {
          showToast("Image has no location data", Toast.LENGTH_SHORT)
        }
      } ?: showToast("Couldn't open image", Toast.LENGTH_SHORT)
    } catch (e: IOException) {
      Log.e("EXIFError", "Error reading EXIF metadata", e)
      showToast("Error reading image metadata", Toast.LENGTH_SHORT)
    } finally {
      inputStream?.close()
    }
  }

  /**
   * Handles permission request results.
   *
   * Forwards permission results to GalleryPermissionManager and GPSManager.
   *
   * @param requestCode Request code identifying the permission request
   * @param permissions Requested permissions
   * @param grantResults Grant results for the corresponding permissions
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