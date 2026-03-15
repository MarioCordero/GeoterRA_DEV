package com.inii.geoterra.development.ui.requests.models

import android.icu.text.SimpleDateFormat
import android.icu.util.Calendar
import android.net.Uri
import androidx.lifecycle.*
import androidx.exifinterface.media.ExifInterface
import com.inii.geoterra.development.Geoterra
import com.inii.geoterra.development.api.common.models.ApiError
import com.inii.geoterra.development.api.requests.models.AnalysisRequest
import com.inii.geoterra.development.api.requests.models.RequestFormUiState
import com.inii.geoterra.development.device.FragmentPermissionRequester
import com.inii.geoterra.development.interfaces.PageViewModel
import com.inii.geoterra.development.managers.SessionManager
import com.inii.geoterra.development.api.requests.models.RequestResponse
import com.inii.geoterra.development.api.requests.models.ThermalManifestationType
import com.inii.geoterra.development.api.requests.models.ValidationErrorKey
import dagger.assisted.Assisted
import dagger.assisted.AssistedFactory
import dagger.assisted.AssistedInject
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import timber.log.Timber
import java.io.IOException
import java.io.InputStream
import java.util.Locale

/**
 * @class AnalysisFormViewModel
 * @brief ViewModel that encapsulates all business logic and state management
 * for the analysis request form.
 *
 * Extends PageViewModel for shared UI state and error handling capabilities.
 */
class RequestFormViewModel @AssistedInject constructor(
  private val app : Geoterra,
  @Assisted private val initialRequest: AnalysisRequest
) : PageViewModel(app) {

  @AssistedFactory
  /** Interface for assisted injection factory */
  interface Factory {
    fun create(initialRequest: AnalysisRequest): RequestFormViewModel
  }

  /** Calendar for date management */
  private val calendar: Calendar = Calendar.getInstance()
  /** Date formatter for UI */
  private val dateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())

  private val _formState = MutableLiveData(RequestFormUiState(initialRequest))
  /** Public immutable UI state */
  val formState: LiveData<RequestFormUiState> = _formState

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
  private val _isSuccessful = MutableLiveData<Boolean>()
  val isSuccessful: LiveData<Boolean> = _isSuccessful

  /** LiveData to handle gallery permission status */
  private val _galleryPermissionRequired = MutableLiveData<Boolean>()
  val galleryPermissionRequired: LiveData<Boolean> = _galleryPermissionRequired

  init {
    Timber.d("ViewModel initialized with request: $initialRequest")

    // Observa cambios en el formState para debug
    _formState.observeForever { state ->
      Timber.d("FormState updated: $state")
    }
  }

  /**
   * Updates the date value when the user picks a date.
   */
  fun updateDate(year: Int, month: Int, dayOfMonth: Int) {
    calendar.set(Calendar.YEAR, year)
    calendar.set(Calendar.MONTH, month)
    calendar.set(Calendar.DAY_OF_MONTH, dayOfMonth)
    saveFormState(date = dateFormat.format(calendar.time))

    // Log para depuración
    Timber.d("Date updated: ${dateFormat.format(calendar.time)}")
  }

  /**
   * Initializes or checks the GPS Manager and attempts to update coordinates in the payload.
   */
  fun updateCoordinatesFromLocation() {
    if (this.app.isGPSManagerInitialized()) {
      this.app.startLocationUpdates()
      val userLocation = this.app.getLastKnownLocation()
      if (userLocation != null) {
        saveFormState(
          latitude = userLocation.latitude,
          longitude = userLocation.longitude
        )

        _toastMessage.postValue(
          "Lat %.4f, Lon %.4f".format(Locale.US, userLocation.latitude, userLocation.longitude
          )
        )
        return
      }
    }
  }

  fun onPermissionResult(requestCode: Int, grantResults: IntArray,
    permissionRequester: FragmentPermissionRequester
  ) {
    this.app.propagatePermissionsResult(
      requestCode, grantResults, permissionRequester
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

  fun initLocationService(permissionRequester: FragmentPermissionRequester) {
    this.app.initLocationService(permissionRequester)
  }

  /**
   * Requests the gallery permission.
   */
  fun initGalleryService(permissionRequester: FragmentPermissionRequester) {
    this.app.initGalleryService(permissionRequester)
  }

  /**
   * Handles selected image URI: extracts location metadata and updates payload.
   */
  fun handleImageUri(uri: Uri) {
    var inputStream: InputStream? = null
    try {
      inputStream = this.appContext.contentResolver.openInputStream(uri)

      inputStream.let { stream ->
        val exifInterface = ExifInterface(stream!!)
        val coordinates = exifInterface.getLatLong()
        if (coordinates != null) {
          saveFormState(
            latitude = coordinates[0],
            longitude = coordinates[1]
          )
          _toastMessage.postValue("Lat: ${coordinates[0]}, Lon: ${coordinates[1]}")
          Timber.i("EXIF Location extracted and set.")
        } else {
          _toastMessage.postValue("La imagen no contiene coordenadas EXIF")
        }
      }
    } catch (e: IOException) {
      Timber.e(e, "Error reading EXIF metadata")
      _toastMessage.postValue("Error leyendo  la información EXIF")
    } finally {
      inputStream?.close()
    }
  }

  /**
   * Validates the form input fields and updates error LiveData.
   * If valid, populates the payload with form data.
   *
   * @return true if form is valid; false otherwise
   */
  private fun validatePayload(requestPayload: AnalysisRequest): Boolean {
    _identifierError.value = null
    _dateError.value = null

    requestPayload.let {
      val result = requestPayload.validate()

      if (!result.isValid) {
        result.errors.forEach { (key, message) ->
          when (key) {
            ValidationErrorKey.ID -> _identifierError.postValue(message)
            ValidationErrorKey.DATE -> _dateError.postValue(message)
            ValidationErrorKey.COORDINATES -> _toastMessage.postValue(message)
            ValidationErrorKey.EMAIL -> _toastMessage.postValue(message)
            else -> Timber.w("Unhandled validation error: $key")
          }
        }
        return false
      }

      try {
        if (requestPayload.type == ThermalManifestationType.FUMAROLE) {
          requestPayload.bubbles = 0
        } else {
          requestPayload.bubbles = 1
        }

        Timber.i("Form data accepted for payload: $requestPayload")
      } catch (e: Exception) {
        Timber.e(e, "Error populating form data")
        return false
      }
    }

    return true
  }

  fun saveFormState(
    identifier: String? = null,
    ownerName: String? = null,
    ownerContact: String? = null,
    currentUsage: String? = null,
    details: String? = null,
    date: String? = null,
    latitude: Double? = null,
    longitude: Double? = null
  ) {
    val current = _formState.value ?: return

    _formState.value = current.copy(
      identifier = identifier?.trim() ?: current.identifier,
      ownerName = ownerName?.trim() ?: current.ownerName,
      ownerContact = ownerContact?.trim() ?: current.ownerContact,
      currentUsage = currentUsage?.trim() ?: current.currentUsage,
      details = details?.trim() ?: current.details,
      date = date ?: current.date,
      latitude = latitude ?: current.latitude,
      longitude = longitude ?: current.longitude
    )
  }

  /**
   * Sends the populated request payload to the backend.
   */
  fun submitRequest() {
    _formState.value?.let { state ->
      val payload = AnalysisRequest(state)
      payload.email = SessionManager.getUserEmail().toString()
      if (validatePayload(payload)) {
        payload.let {
          this.API.submitAnalysisRequest(
            it.id, it.region, it.date, SessionManager.getUserEmail().toString(), it.owner,
            it.currentUsage, it.address, it.contactNumber, "${it.latitude}, ${it.longitude}",
            it.thermalSensation, it.bubbles, it.latitude, it.longitude
          ).enqueue(object : Callback<RequestResponse> {

            override fun onResponse(
              call: Call<RequestResponse>, response: Response<RequestResponse>) {
              if (response.isSuccessful) {
                handleRequestResponse(response.body())
              } else {
                _toastMessage.postValue("Error creando la solicitud")
                Timber.e("Error creando la solicitud: ${response.code()}")
              }
            }

            override fun onFailure(call: Call<RequestResponse>, t: Throwable) {
              _toastMessage.postValue("Error del servidor: ${t.message}")
              Timber.e(t, "Error del servidor: ${t.message}")
            }
          })
        }
      }
    }
  }

  /**
   * Processes the server response after form submission.
   */
  private fun handleRequestResponse(response: RequestResponse?) {
    response?.let {
      if (it.errors.isEmpty()) {
        if (it.response == "Ok") {
          _formState.postValue(RequestFormUiState())
          _toastMessage.postValue("Solicitud creada exitosamente")
          _isSuccessful.postValue(true)
        } else {
          _toastMessage.postValue("Error creando la solicitud")
        }
      } else {
        handleServerErrors(it.errors)
      }
    }
  }

  /**
   * Logs and handles server validation errors.
   */
  private fun handleServerErrors(errors: List<ApiError>) {
    val firstError = errors.firstOrNull()
    if (firstError != null) {
      _toastMessage.postValue("Servidor: " + firstError.message)
    }
    for (error in errors) {
      error.message.let { Timber.tag(it).e(error.message) }
    }
  }
}
