package com.inii.geoterra.development.ui.requests.models

import android.icu.text.SimpleDateFormat
import android.icu.util.Calendar
import android.net.Uri
import android.util.Log
import androidx.lifecycle.*
import androidx.exifinterface.media.ExifInterface
import com.inii.geoterra.development.Geoterra
import com.inii.geoterra.development.api.AnalysisRequestPayload
import com.inii.geoterra.development.api.Error
import com.inii.geoterra.development.api.RequestResponse
import com.inii.geoterra.development.device.FragmentPermissionRequester
import com.inii.geoterra.development.interfaces.PageViewModel
import com.inii.geoterra.development.managers.SessionManager
import com.inii.geoterra.development.ui.map.views.MapView
import com.inii.geoterra.development.ui.requests.views.AnalysisFormView
import dagger.hilt.android.lifecycle.HiltViewModel
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import timber.log.Timber
import java.io.IOException
import java.io.InputStream
import java.util.Locale
import javax.inject.Inject

/**
 * @class AnalysisFormViewModel
 * @brief ViewModel that encapsulates all business logic and state management
 * for the analysis request form.
 *
 * Extends PageViewModel for shared UI state and error handling capabilities.
 */
@HiltViewModel
class AnalysisFormViewModel @Inject constructor(
  private val app : Geoterra
) : PageViewModel(app) {

  /** Holds the form payload data */
  private val analysisRequestPayload = AnalysisRequestPayload()

  /** Calendar for date management */
  private val calendar: Calendar = Calendar.getInstance()

  /** Date formatter for UI */
  private val dateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())

  /** LiveData for date input field */
  private val _dateInput = MutableLiveData(dateFormat.format(calendar.time))
  val dateInput: LiveData<String> = _dateInput

  /** LiveData for identifier input errors */
  private val _identifierError = MutableLiveData<String?>()
  val identifierError: LiveData<String?> = _identifierError

  /** LiveData for date input errors */
  private val _dateError = MutableLiveData<String?>()
  val dateError: LiveData<String?> = _dateError

  /** LiveData for toast messages to be shown */
  private val _toastMessage = MutableLiveData<String?>()
  val toastMessage: LiveData<String?> = _toastMessage

  /** LiveData to notify form submission success */
  private val _formSubmitted = MutableLiveData<Boolean>()
  val formSubmitted: LiveData<Boolean> = _formSubmitted

  /** LiveData to handle gallery permission status */
  private val _galleryPermissionRequired = MutableLiveData<Boolean>()
  val galleryPermissionRequired: LiveData<Boolean> = _galleryPermissionRequired

  /**
   * Updates the date value when the user picks a date.
   */
  fun updateDate(year: Int, month: Int, dayOfMonth: Int) {
    calendar.set(Calendar.YEAR, year)
    calendar.set(Calendar.MONTH, month)
    calendar.set(Calendar.DAY_OF_MONTH, dayOfMonth)
    _dateInput.value = dateFormat.format(calendar.time)
  }

  /**
   * Initializes or checks the GPS Manager and attempts to update coordinates in the payload.
   */
  fun updateCoordinatesFromLocation(view : AnalysisFormView) {
    if (this.app.isGPSManagerInitialized()) {
      this.app.startLocationUpdates()
      val userLocation = this.app.getLastKnownLocation()
      if (userLocation != null) {
        analysisRequestPayload.latitude = "${userLocation.latitude}"
        analysisRequestPayload.longitude = "${userLocation.longitude}"
        analysisRequestPayload.coordinates = "${userLocation.latitude}, ${userLocation.longitude}"
        _toastMessage.value = "Lat ${userLocation.latitude}, Lon ${userLocation.longitude}"
        Timber.i("Coordinates set to payload: $analysisRequestPayload")
        return
      }
      this.app.initLocationService(FragmentPermissionRequester(view))
    }
  }

  fun onPermissionResult(requestCode: Int, grantResults: IntArray,
    view: AnalysisFormView
  ) {
    this.app.propagatePermissionsResult(
      requestCode, grantResults, FragmentPermissionRequester(view)
    )
  }

  /**
   * Checks gallery permission and requests if needed.
   * Returns true if ready to open gallery, false otherwise.
   */
  fun isGalleryPermissionReady(): Boolean {
    return if (!this.app.isGalleryManagerInitialized()) {
      _galleryPermissionRequired.value = true
      false
    } else {
      true
    }
  }

  fun isGPSManagerInitialized(): Boolean {
    return this.app.isGPSManagerInitialized()
  }

  fun initLocationService(view : AnalysisFormView) {
    this.app.initLocationService(FragmentPermissionRequester(view))
  }

  /**
   * Requests the gallery permission.
   */
  fun initGalleryService(view : AnalysisFormView) {
    this.app.initGalleryService(FragmentPermissionRequester(view))
  }

  /**
   * Handles selected image URI: extracts location metadata and updates payload.
   */
  fun handleImageUri(uri: Uri) {
    var inputStream: InputStream? = null
    try {
      inputStream = this.appContext.contentResolver.openInputStream(uri)

      inputStream.let {
        val exifInterface = ExifInterface(it!!)
        val coordinates = exifInterface.getLatLong()
        if (coordinates != null) {
          analysisRequestPayload.latitude = "${coordinates[0]}"
          analysisRequestPayload.longitude = "${coordinates[1]}"
          _toastMessage.value = "Lat: ${coordinates[0]}, Lon: ${coordinates[1]}"
          Timber.i("EXIF Location extracted and set.")
        } else {
          _toastMessage.value = "Image has no location data"
        }
      }
    } catch (e: IOException) {
      Timber.e(e, "Error reading EXIF metadata")
      _toastMessage.value = "Error reading image metadata"
    } finally {
      inputStream?.close()
    }
  }

  /**
   * Validates the form input fields and updates error LiveData.
   * If valid, populates the payload with form data.
   *
   * @param identifier Input identifier string
   * @param ownersName Owner's name input string
   * @param usage Current usage input string
   * @param details Details input string
   * @param isTerrainForm Boolean indicating whether terrain form is active
   * @return true if form is valid; false otherwise
   */
  fun validateAndPopulateFormData(
    identifier: String,
    ownersName: String,
    usage: String,
    details: String,
    isTerrainForm: Boolean
  ): Boolean {
    var isValid = true

    _identifierError.value = null
    _dateError.value = null

    if (identifier.isBlank()) {
      _identifierError.value = "Ingrese un identificador"
      isValid = false
    }

    if (_dateInput.value.isNullOrBlank()) {
      _dateError.value = "Ingrese una fecha"
      isValid = false
    }

    if (analysisRequestPayload.latitude.isBlank()
      || analysisRequestPayload.longitude.isBlank()) {
      _toastMessage.value = "Seleccione un método de captura de coordenadas"
      isValid = false
    }

    if (!isValid) return false

    try {
      if (isTerrainForm) {
        analysisRequestPayload.thermalSensation = 2
        analysisRequestPayload.bubbles = 1
      } else {
        analysisRequestPayload.thermalSensation = 2
        analysisRequestPayload.bubbles = 1
      }

      analysisRequestPayload.apply {
        id = identifier
        region = "Guanacaste"
        date = _dateInput.value ?: ""
        email = SessionManager.getUserEmail().toString()
        owner = ownersName
        currentUsage = usage
        this.details = details
        ownerContact = "98989999"
      }

      Timber.i("Form data populated: $analysisRequestPayload")
    } catch (e: Exception) {
      Timber.e(e, "Error populating form data")
      return false
    }

    return true
  }

  /**
   * Sends the populated request payload to the backend.
   */
  fun sendRequest() {
    this.API.newRequest(
      analysisRequestPayload.id,
      analysisRequestPayload.region,
      analysisRequestPayload.date,
      analysisRequestPayload.email,
      analysisRequestPayload.owner,
      analysisRequestPayload.currentUsage,
      analysisRequestPayload.details,
      analysisRequestPayload.ownerContact,
      analysisRequestPayload.coordinates,
      analysisRequestPayload.thermalSensation,
      analysisRequestPayload.bubbles,
      analysisRequestPayload.latitude,
      analysisRequestPayload.longitude
    ).enqueue(object : Callback<RequestResponse> {

      override fun onResponse(call: Call<RequestResponse>,
        response: Response<RequestResponse>) {
        if (response.isSuccessful) {
          handleRequestResponse(response.body())
        } else {
          _toastMessage.postValue("Error creating request")
          Timber.e("Error creating request: ${response.code()}")
        }
      }

      override fun onFailure(call: Call<RequestResponse>, t: Throwable) {
        _toastMessage.postValue("Connection error: ${t.message}")
        Timber.e(t, "Network failure")
      }
    })
  }

  /**
   * Processes the server response after form submission.
   */
  private fun handleRequestResponse(response: RequestResponse?) {
    response?.let {
      if (it.errors.isEmpty()) {
        if (it.response == "Ok") {
          _toastMessage.postValue("Request created successfully")
          _formSubmitted.postValue(true)
        } else {
          _toastMessage.postValue("Error creating request")
        }
      } else {
        handleServerErrors(it.errors)
      }
    }
  }

  /**
   * Logs and handles server validation errors.
   */
  private fun handleServerErrors(errors: List<Error>) {
    val firstError = errors.firstOrNull()
    if (firstError != null) {
      _toastMessage.postValue(firstError.message)
    }
    for (error in errors) {
      Timber.tag(error.type).e(error.message)
    }
  }
}
