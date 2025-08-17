package com.inii.geoterra.development.ui.account.views

import android.os.Bundle
import android.text.InputType
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import androidx.fragment.app.viewModels
import androidx.lifecycle.Observer
import com.inii.geoterra.development.databinding.FragmentLoginBinding
import com.inii.geoterra.development.interfaces.PageView
import com.inii.geoterra.development.ui.account.models.LoginViewModel
import dagger.hilt.android.AndroidEntryPoint
import timber.log.Timber

/**
 * @brief Fragment handling user authentication flow
 *
 * Manages login UI interactions, credential validation, and API communication.
 * Provides password visibility toggle and sign-up navigation.
 *
 */
@AndroidEntryPoint
class LoginView : PageView<FragmentLoginBinding, LoginViewModel>(
  FragmentLoginBinding::inflate,
  LoginViewModel::class.java
) {

  override val viewModel : LoginViewModel by viewModels()

  // =============== LIFECYCLE METHODS ===============
  /**
   * Called after the view hierarchy associated with the fragment has been created.
   *
   *  Observes LiveData from the ViewModel to update UI reactively
   *
   * @param savedInstanceState If non-null, this fragment is being re-constructed from a previous saved state.
   */
  override fun onCreatePage(savedInstanceState: Bundle?) {
  }

  /**
   * @brief Sets all the listeners related to the View.
   *
   * Subclasses should implement this method to observe set their listeners.
   */
  override fun setUpListeners() {
    this.binding.apply {

      ltTogglePassword.setOnClickListener {
        binding.cboxTogglePassword.isChecked =
          !binding.cboxTogglePassword.isChecked
      }

      cboxTogglePassword.setOnCheckedChangeListener { _, isChecked ->
        updatePasswordVisibility(isChecked)
      }

      tvSignUp.setOnClickListener {
        showSignUpForm()
      }

      btnLogin.setOnClickListener {
        // Delegate login attempt to ViewModel
        viewModel.attemptLogin(
          binding.etEmail.text.toString(),
          binding.etPassword.text.toString()
        )
      }

    }
  }

  /**
   * @brief Observes ViewModel LiveData for login results and errors
   */
  override fun observeViewModel() {
    viewModel.errorMessage.observe(viewLifecycleOwner, Observer { error ->
      error?.let { showError(it) }
    })

    viewModel.loginSuccess.observe(viewLifecycleOwner, Observer { success ->
      if (success) onLoginSuccess()
    })
  }

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
  override fun onCreatePageView(inflater : LayoutInflater,
    container : ViewGroup?
  ) : View {

    return binding.root
  }

  // =============== NAVIGATION METHODS ===============
  /**
   * @brief Transitions to user registration screen
   */
  private fun showSignUpForm() {
    // Make form container visible
    val container = this.binding.fragmentSignupContainer
    container.visibility = View.VISIBLE

    // Perform fragment transaction
    this.childFragmentManager.beginTransaction()
      .replace(container.id, SignUpView())
      .addToBackStack(null)  // Allow back navigation
      .commit()
  }

  /**
   * @brief Handles the events triggered by child fragments.
   *
   * @param event Name of the event
   * @param data Optional data associated with the event
   */
  override fun onFragmentEvent(event: String, data: Any?) {
    Timber.i("Event: $event")
    when (event) {
      "FINISHED" -> {
        // Handle form submission completion
        Timber.i("FINISHED")
        this.binding.fragmentSignupContainer.visibility = View.GONE
        this.childFragmentManager.popBackStack()
      }
    }
  }

  /**
   * @brief Notifies host component about successful login
   */
  private fun onLoginSuccess() {
    this.listener?.onFragmentEvent("USER_LOGGED_IN")
  }

  // =============== UTILITY METHODS ===============
  /**
   * @brief Updates password field visibility state
   * @param showPassword Flag indicating whether to display password text
   */
  private fun updatePasswordVisibility(showPassword: Boolean) {
    val inputType = if (showPassword) {
      InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_VARIATION_VISIBLE_PASSWORD
    } else {
      InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_VARIATION_PASSWORD
    }

    binding.etPassword.inputType = inputType
    binding.etPassword.setSelection(binding.etPassword.text.length)
  }

}