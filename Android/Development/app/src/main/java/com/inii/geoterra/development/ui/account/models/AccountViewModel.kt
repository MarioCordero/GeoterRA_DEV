package com.inii.geoterra.development.ui.account.models

import android.content.Context
import android.util.Log
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import com.inii.geoterra.development.Geoterra
import com.inii.geoterra.development.api.authentication.models.UserProfile
import com.inii.geoterra.development.api.authentication.models.UserProfileResponse
import com.inii.geoterra.development.api.requests.models.AnalysisRequest
import com.inii.geoterra.development.api.requests.models.UserRequestsResponse
import com.inii.geoterra.development.interfaces.PageViewModel
import com.inii.geoterra.development.managers.SessionManager
import dagger.hilt.android.lifecycle.HiltViewModel
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import timber.log.Timber
import javax.inject.Inject

/**
 * @class AccountViewModel
 * @brief Manages business logic and data for the AccountView.
 *
 * This ViewModel is responsible for:
 * - Initiating API calls to fetch user account information and check session status.
 * - Handling responses from these API calls, including success and error scenarios.
 * - Storing and exposing user information and session status through observable LiveData.
 * - Providing a clear separation of concerns, keeping the AccountView focused on UI rendering.
 */
@HiltViewModel
class AccountViewModel @Inject constructor(
  private val app: Geoterra
) : PageViewModel(app) {

  /** LiveData holding user account details */
  private val _userInfo = MutableLiveData<UserProfile?>()
  val userInfo : MutableLiveData<UserProfile?> get() = _userInfo

  /** LiveData holding number of requests made by the user */
  private val _requestsMade = MutableLiveData<Int>()
  val requestsMade : LiveData<Int> get() = _requestsMade

  /** LiveData holding number of requests made by the user accepted */
  private val _requestsAccepted = MutableLiveData<Int>()
  val requestsAccepted : LiveData<Int> get() = _requestsAccepted

  /**
   * Session state observed from SessionManager.
   * This is the SINGLE source of truth.
   */
  val sessionActive : LiveData<Boolean> = SessionManager.sessionActive

  init {
    observeSessionState()
  }

  /**
   * Observes session changes and triggers business logic.
   */
  private fun observeSessionState() {
    sessionActive.observeForever { isActive ->
      if (isActive) {
        fetchUserInformation()
      } else {
        clearUserData()
      }
    }
  }

  /**
   * Clears all user-related data on logout.
   */
  private fun clearUserData() {
    _userInfo.postValue(null)
    _requestsMade.postValue(0)
    _requestsAccepted.postValue(0)
  }

  /**
   * @brief Triggers retrieval of user information using stored session tv_email
   */
  fun fetchUserInformation() { // Retrieve the user's email from the session manager.
    val email = SessionManager.getUserEmail() ?: return

    // Asynchronously request user info using Retrofit
    this.API.apply { fetchUserProfile(email).enqueue(object : Callback<UserProfileResponse> {
        override fun onResponse(call : Call<UserProfileResponse>,
          response : Response<UserProfileResponse>
        ) {
          if (response.isSuccessful) {
            val body = response.body()
            if (body?.response == "Ok") {
              _userInfo.postValue(body.data)
            } else {
              _errorMessage.value =
                String.format("Error del servidor: ${body?.response}")
              Timber.e("Error del servidor: ${body?.response}")
            }
          } else {
            _errorMessage.value =
              String.format("HTTP error: ${response.code()}")
            Timber.e("HTTP error: ${response.code()}")
          }
        }

        override fun onFailure(call : Call<UserProfileResponse>, t : Throwable) {
          _errorMessage.value =
            String.format("Fallo de conexión: ${t.localizedMessage}")
          Timber.e("Fallo de conexión: ${t.localizedMessage}")
        }
      })

      fetchUserRequests(email).enqueue(object : Callback<UserRequestsResponse> {
        override fun onResponse(call : Call<UserRequestsResponse>,
                                response : Response<UserRequestsResponse>
        ) {
          if (response.isSuccessful) {
            obtainRequestInfo(response.body()?.data ?: emptyList())
          } else {
            _errorMessage.postValue(
              "Carga de solicitudes fallida: " +
                      "${response.code()}")
            Timber.e("Response error: ${response.code()}")
          }
        }

        override fun onFailure(call : Call<UserRequestsResponse>,
                               t : Throwable
        ) {
          _errorMessage.postValue("Error obteniendo las solicitudes del " +
                  "servidor: ${t.message}")
          Timber.e(t, "API call failed")
        }
      })
    }
  }

  private fun obtainRequestInfo(list : List<AnalysisRequest>) {
    _requestsMade.postValue(list.size)
    _requestsAccepted.postValue(0) // Ajustar cuando exista criterio
  }
}
