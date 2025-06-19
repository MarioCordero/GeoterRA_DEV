package com.inii.geoterra.development.interfaces

import android.content.Context
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
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
  var apiService: APIService = RetrofitClient.getAPIService()

  /** @brief Listener reference for fragment-to-host communication */
  protected var listener: FragmentListener? = null

  /** @brief Callback for handling back press events */
  private lateinit var onBackPressedCallback: OnBackPressedCallback

  /**
   * @brief Establishes FragmentListener connection during attachment
   * @param context Host context implementing FragmentListener
   *
   * Automatically connects to parent fragment or activity implementing FragmentListener.
   * Priority order: Parent Fragment > Host Activity
   */
  final override fun onAttach(context: Context) {
    super.onAttach(context)

//    (parentFragment as? PageFragment)?.onPause()

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

//    if (parentFragment is PageFragment) {
//      this.onResume()
//    }
  }

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    // Initialize and add the OnBackPressedCallback
    // This callback will only be called when this Fragment is at least Started.
    this.onBackPressedCallback = object : OnBackPressedCallback(true) {
      override fun handleOnBackPressed() {
        // Delegate to our custom back press handling method
        if (!handleBackPress()) {
          // If the fragment's custom logic didn't consume the event,
          // disable this callback and let the Activity or other callbacks
          // handle it.
          Log.d(
            "PageFragment",
            this@PageFragment.javaClass.simpleName +
              " OnBackPressedCallback: Not handled, propagating to system."
          )
          this.isEnabled = false // Disable this callback
          requireActivity().onBackPressedDispatcher.onBackPressed()
        } else {
          Log.d(
            "PageFragment",
            this@PageFragment.javaClass.simpleName +
              " OnBackPressedCallback: Handled by fragment."
          )
        }
      }
    }
    this.requireActivity().onBackPressedDispatcher.addCallback(
      this,
      onBackPressedCallback
    )
  }
  /**
   * @brief Logic to be executed when the back button is pressed within this fragment.
   * @return Boolean indicating if event was consumed (true) or should propagate (false).
   *
   * Override this in child fragments to implement custom back navigation logic.
   * Default implementation doesn't consume back press.
   * This method will be called by the OnBackPressedCallback.
   */
  open fun handleBackPress(): Boolean {
    // Default implementation doesn't consume event
    // Child fragments should override this to provide specific
    // back press handling.
    for (child in childFragmentManager.fragments) {
      if (child is PageFragment && child.isVisible && child.handleBackPress()) {
        return true
      }
    }

    Log.d(
      "PageFragment",
      "${this.javaClass.simpleName} handleBackPress: false (default)"
    )
    return false
  }

  override fun onResume() {
    super.onResume()
    val fragmentName = this.javaClass.simpleName
    // Only enable the callback if the fragment is currently visible to the user
    // and is in the resumed state.
    if (isVisible && ::onBackPressedCallback.isInitialized) {
      Log.d(
        "PageFragment",
        "$fragmentName: onResume - Fragment is visible," +
          " enabling OnBackPressedCallback."
      )
      onBackPressedCallback.isEnabled = true
    } else {
      if(::onBackPressedCallback.isInitialized) { // still check for initialization before disabling
        Log.d(
          "PageFragment",
          "$fragmentName: onResume - Fragment is NOT visible or callback" +
            " not init, ensuring OnBackPressedCallback is disabled."
        )
        onBackPressedCallback.isEnabled = false
      }
    }
  }

  override fun onPause() {
    super.onPause()
    val fragmentName = this.javaClass.simpleName
    if (::onBackPressedCallback.isInitialized) {
      Log.d(
        "PageFragment",
        "$fragmentName: onPause - Disabling OnBackPressedCallback."
      )
      onBackPressedCallback.isEnabled = false
    }
  }

  /**
   * Called when the hidden state (as managed by FragmentManager) of the fragment has changed.
   * This is a key lifecycle callback for managing state with hide/show transactions.
   * @param hidden True if the fragment is now hidden, false if it is now visible.
   */
  override fun onHiddenChanged(hidden: Boolean) {
    super.onHiddenChanged(hidden) // It's good practice to call super first.
    val fragmentName = this.javaClass.simpleName
    if (::onBackPressedCallback.isInitialized) {
      if (hidden) {
        Log.d(
          "PageFragment",
          "$fragmentName: onHiddenChanged(true) - Fragment hidden," +
            " disabling OnBackPressedCallback."
        )
        onBackPressedCallback.isEnabled = false
      } else {
        // Fragment is now shown. Enable callback ONLY if fragment is also in resumed state.
        // This prevents enabling the callback if the fragment is shown but its onResume() hasn't run yet
        // or if it was shown while the activity was paused.
        if (isResumed) {
          Log.d(
            "PageFragment",
            "$fragmentName: onHiddenChanged(false) - Fragment shown" +
              " AND resumed, enabling OnBackPressedCallback."
          )
          onBackPressedCallback.isEnabled = true
        } else {
          Log.d(
            "PageFragment",
            "$fragmentName: onHiddenChanged(false) - Fragment shown but" +
              " NOT resumed, callback remains disabled" +
              " (will be handled by onResume)."
          )
        }
      }
    } else {
      Log.w(
        "PageFragment",
        "$fragmentName: onHiddenChanged -" +
          " onBackPressedCallback was not initialized."
      )
    }
  }

  /**
   * @brief Performs cleanup when fragment is hidden
   *
   * Clears all child fragments by default. Override to add custom hide behavior
   * while maintaining base cleanup functionality with `super.onHide()`
   */
  open fun onHide() {
    val fragmentName = this.javaClass.simpleName

    if (isAdded && isStateSaved) { // Check isStateSaved to avoid committing after state save
      Log.w("PageFragment", "$fragmentName: onHide - State already saved, cannot commit child fragment removal. Consider using commitAllowingStateLoss or handling differently.")
    } else if (isAdded) {
      try {
        childFragmentManager.fragments.forEach { childFragment ->
          if (childFragment.isAdded) {
            Log.d("PageFragment", "$fragmentName: onHide - Removing child fragment: ${childFragment.javaClass.simpleName}")
            childFragmentManager.beginTransaction()
              .remove(childFragment).commit() // Consider commitNow() if appropriate and not causing issues
          }
        }
      } catch (e: IllegalStateException) {
        Log.e("PageFragment", "$fragmentName: onHide - Error removing child fragments: ${e.message}. Might be due to state saving.")
        // Fallback or alternative cleanup if needed
        childFragmentManager.fragments.forEach { childFragment ->
          if (childFragment.isAdded) {
            childFragmentManager.beginTransaction().remove(childFragment).commitAllowingStateLoss()
          }
        }
      }
    }
  }

  /**
   * @brief Hook method for fragment visibility changes
   *
   * Called when fragment becomes visible. Override to implement
   * view updates or data refresh logic.
   */
  open fun onShow() {
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

  /**
   * Displays a toast message.
   *
   * @param message Message to display
   * @param duration Duration of the toast (default: short)
   */
  protected fun showToast(message: String, duration: Int = Toast.LENGTH_SHORT) {
    Toast.makeText(requireContext(), message, duration).show()
  }
}
