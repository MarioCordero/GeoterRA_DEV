package com.inii.geoterra.development.interfaces

import android.content.Context
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.inii.geoterra.development.Geoterra
import com.inii.geoterra.development.api.APIService
import com.inii.geoterra.development.api.RetrofitClient
import timber.log.Timber

/**
 * @brief Base ViewModel class for managing UI-related data.
 *
 * This abstract class serves as a foundation for ViewModels that are associated with specific pages or screens in the application.
 * It provides common functionality and properties that subclasses can leverage.
 *
 */
abstract class PageViewModel (
  protected val appContext: Geoterra
) : ViewModel() {

  /** @brief Retrofit API service instance for network operations */
  protected val API: APIService = RetrofitClient.getAPIService()

  /** Observable error messages to be displayed on the UI */
  protected val _errorMessage = MutableLiveData<String>()
  val errorMessage: LiveData<String> get() = _errorMessage

  /**
   * @brief Validates tv_email format using Android standard patterns.
   * @return Boolean true if valid tv_email
   */
  fun String.isValidEmail(): Boolean {
    return android.util.Patterns.EMAIL_ADDRESS.matcher(this).matches()
  }

  /**
   * @brief Publishes error message to LiveData and logs it.
   *
   * Updates the base class's errorMessage LiveData to notify observers.
   *
   * @param message The error message string to publish.
   */
  protected fun postError(message: String) {
    _errorMessage.postValue(message)
    Timber.e(message)
  }

  /**
   * @brief Clears any existing error message.
   */
  protected fun clearError() {
    _errorMessage.postValue("")
  }

}