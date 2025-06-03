package com.inii.geoterra.development.interfaces

import android.content.Context
import android.util.Log
import android.view.View
import android.widget.Toast
import androidx.fragment.app.Fragment
import com.inii.geoterra.development.api.APIService
import com.inii.geoterra.development.api.RetrofitClient

/**
 * @brief Base fragment class for handling page navigation and lifecycle events
 *
 * Provides common functionality for fragment management including:
 * - Parent/Activity communication via FragmentListener
 * - Child fragment cleanup
 * - Back press handling
 * - Visibility state hooks
 */
open class PageFragment : Fragment(), FragmentListener {
  // =============== VIEW BINDING ===============
  /** @brief Container for fragment's view elements */
  protected lateinit var binding: View

  /** @brief Retrofit API service instance for network operations */
  protected val apiService: APIService = RetrofitClient.getAPIService()

  /** @brief Listener reference for fragment-to-host communication */
  protected var listener: FragmentListener? = null

  /**
   * @brief Establishes FragmentListener connection during attachment
   * @param context Host context implementing FragmentListener
   *
   * Automatically connects to parent fragment or activity implementing FragmentListener.
   * Priority order: Parent Fragment > Host Activity
   */
  final override fun onAttach(context: Context) {
    super.onAttach(context)

    val parent = parentFragment
    if (parent is FragmentListener) {
      this.listener = parent
      Log.i(
        "PageFragment",
        "Connected to parent fragment."
      )
    } else if (context is FragmentListener) {
      this.listener = context
      Log.i(
        "PageFragment",
        "Connected to host activity."
      )
    } else {
      Log.w(
        "PageFragment",
        "Neither parent fragment nor activity implements FragmentListener")
    }
  }

  /**
   * @brief Cleans up FragmentListener reference during detachment
   */
  final override fun onDetach() {
    super.onDetach()
    this.listener = null
  }

  /**
   * @brief Handles back press events in fragments
   * @return Boolean indicating if event was consumed (true) or should propagate (false)
   *
   * Default implementation doesn't consume back press. Override to add custom back navigation logic.
   */
  open fun onBackPressed(): Boolean {
    // Default implementation doesn't consume event
    return false
  }

  /**
   * @brief Performs cleanup when fragment is hidden
   *
   * Clears all child fragments by default. Override to add custom hide behavior
   * while maintaining base cleanup functionality with `super.onHide()`
   */
  open fun onHide() {
    // Cleanup child fragments to prevent memory leaks
    childFragmentManager.fragments.forEach { childFragment ->
      childFragmentManager.beginTransaction().remove(childFragment).commit()
    }
  }

  /**
   * @brief Hook method for fragment visibility changes
   *
   * Called when fragment becomes visible. Override to implement
   * view updates or data refresh logic.
   */
  open fun onShow() {
    // Placeholder for visibility change handling
  }

  // =============== UTILITY METHODS ===============
  /**
   * @brief Displays user-facing error messages
   * @param message Error description to display in Toast
   */
  protected fun showError(message: String) {
    Toast.makeText(requireContext(), message, Toast.LENGTH_LONG).show()
  }

  /**
   * @brief Logs network-related errors with standardized tag
   * @param error Detailed error message for debugging
   */
  protected fun logNetworkError(error: String) {
    Log.i("NetworkError", error)
  }

}
