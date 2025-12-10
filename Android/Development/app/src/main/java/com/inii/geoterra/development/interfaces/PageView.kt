package com.inii.geoterra.development.interfaces

import android.content.Context
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.viewbinding.ViewBinding
import timber.log.Timber

/**
 * @brief Base fragment class for handling page navigation and lifecycle events.
 *
 * Provides common functionality for fragment management including:
 * - Parent/Activity communication via [PageListener].
 * - Child fragment cleanup during [onHide].
 * - Robust back press handling via [OnBackPressedCallback].
 * - Visibility state hooks ([onShow], [onHide]).
 * - ViewBinding and ViewModel integration.
 * - Utility methods for displaying errors and Timbering.
 *
 * This class aims to streamline fragment development by providing a consistent
 * structure and handling common boilerplate code.
 *
 * @param VB The ViewBinding class generated for the fragment's layout.
 * @param VM The [PageViewModel] subclass managing the fragment's business
 * Timbering.
 * @property bindingInflater A lambda function that inflates the ViewBinding for this fragment.
 *                           Example: `MyFragmentBinding::inflate`.
 * @property viewModelClass The Class object for the [PageViewModel] subclass used by this fragment.
 *                          This is used to instantiate the [viewModel].
 */
abstract class PageView<VB : ViewBinding, VM : PageViewModel>(
  /** Provide the inflate function for the specific ViewBinding of the subclass.
   *
   * Example: MyFragmentBinding::inflate
   */
  private val bindingInflater: (LayoutInflater, ViewGroup?, Boolean) -> VB,
  /**
   * Abstract method to provide the ViewModel class used for this fragment.
   * Used with ViewModelProvider to initialize the [viewModel] instance.
   */
  private val viewModelClass: Class<VM>
) : Fragment(), PageListener {

  /** ViewBinding instance (accessible only between onCreateView and onDestroyView) */
  private var _binding: VB? = null

  /** Non-null binding reference within valid lifecycle window */
  protected val binding get() = _binding!!

  /** ViewModelFactory instance (subclasses use it directly) */
  open val viewModelFactory: ViewModelProvider.Factory? = null

  /** ViewModel instance (subclasses use it directly) */
  open val viewModel: VM by lazy {
    if (viewModelFactory != null) {
      ViewModelProvider(this, viewModelFactory!!)[viewModelClass]
    } else {
      ViewModelProvider(this)[viewModelClass]
    }
  }

  /** @brief Listener reference for fragment-to-host communication */
  protected var listener: PageListener? = null

  /** @brief Callback for handling back press events */
  private lateinit var onBackPressedCallback: OnBackPressedCallback

  /**
   * Creates a ViewModelProvider.Factory for assisted ViewModels.
   *
   * @param creator Lambda function that creates the ViewModel instance
   * @return Configured ViewModelProvider.Factory
   */
  inline fun <reified VM : ViewModel> createAssistedViewModelFactory(
    crossinline creator: () -> VM
  ): ViewModelProvider.Factory {
    return object : ViewModelProvider.Factory {
      @Suppress("UNCHECKED_CAST")
      override fun <T : ViewModel> create(modelClass: Class<T>): T {
        // Verify that the requested model class matches our ViewModel type
        require(modelClass.isAssignableFrom(VM::class.java)) {
          "Invalid ViewModel class requested: ${modelClass.name}"
        }
        return creator() as T
      }
    }
  }

  /**
   * @brief Establishes PageListener connection during attachment
   * @param context Host context implementing PageListener
   *
   * Automatically connects to parent fragment or activity implementing PageListener.
   * Priority order: Parent Fragment > Host Activity
   */
  override fun onAttach(context: Context) {
    super.onAttach(context)
//    (parentFragment as? PageView)?.onPause()

    val parent = parentFragment
    if (parent is PageListener) {
      this.listener = parent
      Timber.i("Connected to parent fragment.")
    } else if (context is PageListener) {
      this.listener = context
      Timber.i(
        "PageView",
        "Connected to host activity."
      )
    } else {
      Timber.w(
        "PageView",
        "Neither parent fragment nor activity implements PageListener")
    }
  }

  /**
   * @brief Cleans up PageListener reference during detachment
   */
  override fun onDetach() {
    super.onDetach()
    this.listener = null
  }

  /**
   * @brief Cleans up ViewBinding reference during destruction
   */
  final override fun onDestroyView() {
    super.onDestroyView()
    this._binding = null
  }

  /**
   * Called to have the fragment instantiate its user interface view.
   *
   * This final implementation delegates the view creation to [onCreatePageView].
   *
   * @param inflater The LayoutInflater object that can be used to inflate any views.
   * @param container The parent view that the fragment's UI should be attached to, or null.
   * @param savedInstanceState If non-null, this fragment is being re-constructed from a previous saved state.
   * @return The root view for the fragment's UI.
   */
  final override fun onCreateView(
    inflater: LayoutInflater,
    container: ViewGroup?,
    savedInstanceState: Bundle?
  ): View {
    super.onCreateView(inflater, container, savedInstanceState)
    this._binding = bindingInflater.invoke(inflater, container, false)
    this.onCreatePageView(inflater, container)
    this.setUpListeners()
    return this.binding.root
  }

  final override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
    super.onViewCreated(view, savedInstanceState)
    this.onPageViewCreated(view, savedInstanceState)
    observeViewModel()
  }

  protected open fun onPageViewCreated(
    view: View, savedInstanceState: Bundle?
  ) {}

  /**
   * Called to create the view hierarchy associated with this page or fragment.
   *
   * This abstract method must be implemented by subclasses to inflate and return
   * the root view of the page.
   *
   * @param inflater The LayoutInflater object that can be used to inflate any views.
   * @param container The parent view that the fragment's UI should be attached to, or null.
   * @return The root view for the fragment's UI.
   */
  protected abstract fun onCreatePageView(
    inflater: LayoutInflater,
    container: ViewGroup?
  ): View

  /**
   * Called when the fragment is first created.
   *
   * This method initializes the ViewModel, calls [onCreatePage], observes the ViewModel,
   * and sets up the back press callback.
   *
   * @param savedInstanceState If the fragment is being re-created from a previous saved state, this is the state.
   */
  final override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    // Initialize ViewModel (default ViewModelProvider with Fragment scope)
    this.onCreatePage(savedInstanceState)
    this.setupOnBackPressedCallback()
  }

  /**
   * Called after the view hierarchy associated with the fragment has been created.
   *
   * Subclasses should implement this method to initialize view components, set up observers,
   * or restore state from [savedInstanceState].
   *
   * @param savedInstanceState If non-null, this fragment is being re-constructed from a previous saved state.
   */
  protected abstract fun onCreatePage(savedInstanceState: Bundle?)

  /**
   * Called when the activity is being saved.
   *
   * @param savedInstanceState The bundle to save the state to.
   */
  fun onSavedInstanceState(savedInstanceState: Bundle) {
    super.onSaveInstanceState(savedInstanceState)
    this.onSavePageState(savedInstanceState)
  }

  /**
   * Called when the page state needs to be saved.
   *
   * This method is invoked by the system when the page is about to be destroyed
   * (e.g., due to a configuration change like screen rotation, or when the
   * operating system needs to reclaim resources).
   *
   * You should override this method to store any dynamic state of your page
   * that you want to preserve. The provided `Bundle` can be used to store
   * key-value pairs representing the state. This `Bundle` will then be
   * passed to `onRestorePageState` when the page is recreated.
   *
   * **Important:**
   * - Only save data that is necessary to restore the page to its previous state.
   * - Avoid storing large objects or complex data structures, as this can
   *   impact performance. Consider using persistent storage (e.g., SharedPreferences,
   *   database) for larger data.
   * - This method is typically called before `onStop()`.
   *
   * @param pageState A `Bundle` in which to place your saved state.
   *                  This `Bundle` will be supplied to `onRestorePageState`
   *                  if the page is recreated.
   */
  protected open fun onSavePageState(pageState : Bundle) {}

  /**
   * @brief Hook method for fragment visibility changes
   *
   * Called when fragment becomes visible. Override to implement
   * view updates or data refresh Timbering.
   */
  open fun onShow() {}

  /**
   * @brief Sets up all the event listeners for the View.
   *
   * This method is intended to be overridden by subclasses to register their
   * specific event listeners.
   */
  protected open fun setUpListeners() {}

  /**
   * @brief Observes ViewModel LiveData.
   *
   * Subclasses should override this method to observe LiveData exposed by their corresponding ViewModel.
   * This method is called in the `onViewCreated` lifecycle callback, ensuring that views are
   * available to be updated when LiveData emits new values.
   */
  protected open fun observeViewModel() {}

  /**
   * Sets up an OnBackPressedCallback to handle back press events within the fragment.
   *
   * This function initializes and adds an OnBackPressedCallback to the activity's
   * OnBackPressedDispatcher. The callback is enabled by default and will only be
   * invoked when the fragment is in at least the STARTED state.
   */
  private fun setupOnBackPressedCallback() {
    // Initialize and add the OnBackPressedCallback
    // This callback will only be called when this Fragment is at least Started.
    this.onBackPressedCallback = object : OnBackPressedCallback(true) {
      override fun handleOnBackPressed() {
        // Delegate to our custom back press handling method
        if (!handleBackPress()) {
          // If the fragment's custom Timberic didn't consume the event,
          // disable this callback and let the Activity or other callbacks
          // handle it.
          Timber.d(" OnBackPressedCallback: Not handled, propagating to system."
          )
          this.isEnabled = false // Disable this callback
          requireActivity().onBackPressedDispatcher.onBackPressed()
        } else {
          Timber.d(" OnBackPressedCallback: Handled by fragment."
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
   * @brief Timber to be executed when the back button is pressed within this fragment.
   * @return Boolean indicating if event was consumed (true) or should propagate (false).
   *
   * Override this in child fragments to implement custom back navigation Timberic.
   * Default implementation doesn't consume back press.
   * This method will be called by the OnBackPressedCallback.
   */
  open fun handleBackPress(): Boolean {
    // Default implementation doesn't consume event
    // Child fragments should override this to provide specific
    // back press handling.
    for (child in childFragmentManager.fragments) {
      if (child is PageView<*, *> && child.isVisible && child
        .handleBackPress()) {
        return true
      }
    }

    Timber.d("handleBackPress: false (default)")
    return false
  }

  /**
   * Called when the fragment is visible to the user and actively running.
   *
   * This lifecycle method is overridden to manage the `onBackPressedCallback`.
   * The callback is enabled only if the fragment is currently visible and the
   * callback has been initialized. This ensures that the custom back press
   * handling is active only when this specific fragment is the one the user
   * is interacting with.
   *
   * If the fragment is not visible or the callback is not initialized,
   * the callback is explicitly disabled to prevent unintended back press behavior.
   *
   * Logging is included to track the state of the `onBackPressedCallback`
   * during this lifecycle event.
   */
  override fun onResume() {
    super.onResume()
    val fragmentName = this.javaClass.simpleName
    // Only enable the callback if the fragment is currently visible to the user
    // and is in the resumed state.
    if (isVisible && ::onBackPressedCallback.isInitialized) {
      Timber.d("$fragmentName: onResume - Fragment is visible," +
          " enabling OnBackPressedCallback."
      )
      onBackPressedCallback.isEnabled = true
    } else {
      if(::onBackPressedCallback.isInitialized) { // still check for initialization before disabling
        Timber.d("$fragmentName: onResume - Fragment is NOT visible or callback" +
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
      Timber.d(
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
        onBackPressedCallback.isEnabled = false
      } else {
        // Fragment is now shown. Enable callback ONLY if fragment is also in resumed state.
        // This prevents enabling the callback if the fragment is shown but its onResume() hasn't run yet
        // or if it was shown while the activity was paused.
        if (isResumed) {
          Timber.d("$fragmentName: onHiddenChanged(false) - Fragment shown" +
              " AND resumed, enabling OnBackPressedCallback."
          )
          onBackPressedCallback.isEnabled = true
        } else {
          Timber.d("$fragmentName: onHiddenChanged(false) - Fragment shown but" +
              " NOT resumed, callback remains disabled" +
              " (will be handled by onResume)."
          )
        }
      }
    } else {
      Timber.w("$fragmentName: onHiddenChanged -" +
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
      Timber.w("$fragmentName: onHide - State already saved, cannot commit child fragment removal. Consider using commitAllowingStateLoss or handling differently.")
    } else if (isAdded) {
      try {
        childFragmentManager.fragments.forEach { childFragment ->
          if (childFragment.isAdded) {
            Timber.d("$fragmentName: onHide - Removing child fragment: ${childFragment.javaClass.simpleName}")
            childFragmentManager.beginTransaction()
              .remove(childFragment).commit() // Consider commitNow() if appropriate and not causing issues
          }
        }
      } catch (e: IllegalStateException) {
        Timber.e("$fragmentName: onHide - Error removing child fragments: ${e.message}. Might be due to state saving.")
        // Fallback or alternative cleanup if needed
        childFragmentManager.fragments.forEach { childFragment ->
          if (childFragment.isAdded) {
            childFragmentManager.beginTransaction().remove(childFragment).commitAllowingStateLoss()
          }
        }
      }
    }
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
   * @brief Timbers network-related errors with standardized tag
   * @param error Detailed error message for debugging
   */
  protected fun timberNetworkError(error: String) {
    Timber.i("NetworkError", error)
  }

  /**
   * @brief Timbers network-related errors with standardized tag
   * @param message Detailed message for debugging
   */
  protected fun timberDebug(message: String) {
    Timber.d("Debug", message)
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
