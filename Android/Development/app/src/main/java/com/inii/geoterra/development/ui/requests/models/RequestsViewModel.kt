package com.inii.geoterra.development.ui.requests.models

import android.util.Log
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import com.inii.geoterra.development.Geoterra
import com.inii.geoterra.development.api.AnalysisRequest
import com.inii.geoterra.development.api.RequestsSubmittedResponse
import com.inii.geoterra.development.interfaces.PageViewModel
import com.inii.geoterra.development.managers.SessionManager
import dagger.hilt.android.lifecycle.HiltViewModel
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import javax.inject.Inject

/**
 * ViewModel responsible for managing and loading analysis requests submitted by the user.
 * Encapsulates all business logic and API interaction related to requests.
 */
@HiltViewModel
class RequestsViewModel @Inject constructor(
  private val app : Geoterra
) : PageViewModel(app) {

  /** Backing field for submitted requests */
  private val _submittedRequests = MutableLiveData<List<AnalysisRequest>>()
  /** Public observable LiveData for the UI */
  val submittedRequests: LiveData<List<AnalysisRequest>> get() = _submittedRequests

  /**
   * Loads the submitted requests for the current authenticated user.
   * Triggers API call and updates LiveData accordingly.
   */
  fun fetchSubmittedRequests() {
    val userEmail = SessionManager.getUserEmail()
    if (userEmail == null) {
      // No active user session
      _submittedRequests.postValue(emptyList())
      return
    }

    this.API.getSubmittedRequests(userEmail)
      .enqueue(object : Callback<RequestsSubmittedResponse> {
        override fun onResponse(
          call: Call<RequestsSubmittedResponse>,
          response: Response<RequestsSubmittedResponse>
        ) {
          if (response.isSuccessful) {
            _submittedRequests.postValue(response.body()?.data ?: emptyList())
          } else {
            _errorMessage.postValue("Failed to load requests: ${response.code()}")
            Log.e("RequestsViewModel", "Response error: ${response.code()}")
          }
        }

        override fun onFailure(call: Call<RequestsSubmittedResponse>, t: Throwable) {
          _errorMessage.postValue("Error loading requests: ${t.message}")
          Log.e("RequestsViewModel", "API call failed", t)
        }
      })
  }

  fun setOnSessionStateChangeListener(listener: (isActive: Boolean) -> Unit) {
    SessionManager.setOnSessionStateChangeListener(listener)
  }
}
