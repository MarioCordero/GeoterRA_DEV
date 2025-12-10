package com.inii.geoterra.development.ui.account.models

import android.content.Context
import android.util.Log
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import com.inii.geoterra.development.Geoterra
import com.inii.geoterra.development.api.AnalysisRequest
import com.inii.geoterra.development.api.CheckSessionResponse
import com.inii.geoterra.development.api.RequestsSubmittedResponse
import com.inii.geoterra.development.api.UserInfoResponse
import com.inii.geoterra.development.api.UserInformation
import com.inii.geoterra.development.interfaces.PageViewModel
import com.inii.geoterra.development.managers.SessionManager
import dagger.hilt.android.lifecycle.HiltViewModel
import dagger.hilt.android.qualifiers.ApplicationContext
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
  private val _userInfo = MutableLiveData<UserInformation?>()
  val userInfo : MutableLiveData<UserInformation?> get() = _userInfo

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
    this.API.apply {
      getUserInfo(email).enqueue(object : Callback<UserInfoResponse> {
        override fun onResponse(call : Call<UserInfoResponse>,
          response : Response<UserInfoResponse>
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

        override fun onFailure(call : Call<UserInfoResponse>, t : Throwable) {
          _errorMessage.value =
            String.format("Fallo de conexión: ${t.localizedMessage}")
          Timber.e("Fallo de conexión: ${t.localizedMessage}")
        }
      })

      getSubmittedRequests(email).enqueue(object :
                                            Callback<RequestsSubmittedResponse> {
          override fun onResponse(call : Call<RequestsSubmittedResponse>,
            response : Response<RequestsSubmittedResponse>
          ) {
            if (response.isSuccessful) {
              obtainRequestInfo(response.body()?.data ?: emptyList())
            } else {
              _errorMessage.postValue(
                "Failed to load requests: ${response.code()}")
              Timber.e("Response error: ${response.code()}")
            }
          }

          override fun onFailure(call : Call<RequestsSubmittedResponse>,
            t : Throwable
          ) {
            _errorMessage.postValue("Error loading requests: ${t.message}")
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
