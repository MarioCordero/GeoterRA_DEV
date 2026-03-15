package com.inii.geoterra.development.ui.account.views

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.viewModels
import androidx.lifecycle.Observer
import com.inii.geoterra.development.api.authentication.models.SignUpCredentials
import com.inii.geoterra.development.databinding.FragmentSignUpBinding
import com.inii.geoterra.development.interfaces.PageView
import com.inii.geoterra.development.ui.account.models.SignUpViewModel
import dagger.hilt.android.AndroidEntryPoint

/**
 * @brief Fragment handling user registration flow
 *
 * Manages sign-up form validation, credential submission, and error handling.
 * Provides password visibility toggle and API communication for account creation.
 *
 * @property binding Inflated view hierarchy reference for registration form
 */
@AndroidEntryPoint
class SignUpView : PageView<FragmentSignUpBinding, SignUpViewModel>(
  FragmentSignUpBinding::inflate,
  SignUpViewModel::class.java
) {

  override val viewModel : SignUpViewModel by viewModels()

  // =============== LIFECYCLE METHODS ===============
  /**
   * Called after the view hierarchy associated with the fragment has been created.
   *
   * Subclasses should implement this method to initialize view components, set up observers,
   * or restore state from [savedInstanceState].
   *
   * @param savedInstanceState If non-null, this fragment is being re-constructed from a previous saved state.
   */
  override fun onCreatePage(savedInstanceState: Bundle?) {}

  /**
   * @brief Sets all the listeners related to the View.
   *
   * Subclasses should implement this method to observe set their listeners.
   */
  override fun setUpListeners() {
    this.binding.apply {
      createAccountB.setOnClickListener {
        if (this.etPassword.text.toString()
          != this.etConfirmpassword.text.toString()) {
          viewModel.setErrorMessage("Las contraseñas no coinciden")
          return@setOnClickListener
        }
        val credentials = SignUpCredentials(
          email = binding.etEmail.text.toString().trim(),
          password = binding.etPassword.text.toString().trim(),
          firstName = binding.etFirstname.text.toString().trim(),
          lastName = binding.etLastname.text.toString().trim(),
          phoneNumber = binding.etPhone.text.toString().trim()
        )

        // Delegate to ViewModel for validation and submission
        viewModel.validateAndCreateUser(credentials)
      }

    }
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

  override fun observeViewModel() {
    viewModel.errorMessage.observe(viewLifecycleOwner, Observer { msg ->
      showError(msg)
    })

    viewModel.signUpSuccess.observe(viewLifecycleOwner, Observer { success ->
      if (success) {
        showToast("Cuenta creada exitosamente")
        listener?.onPageEvent("FINISHED")
      }
    })
  }

}