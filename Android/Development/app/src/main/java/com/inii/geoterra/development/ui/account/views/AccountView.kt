package com.inii.geoterra.development.ui.account.views

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.viewModels
import androidx.lifecycle.ViewModelProvider
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.inii.geoterra.development.databinding.FragmentAccountBinding
import com.inii.geoterra.development.interfaces.PageView
import com.inii.geoterra.development.managers.SessionManager
import com.inii.geoterra.development.ui.account.models.AccountViewModel
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject

/**
 * @brief Fragment for displaying and managing user account information.
 *
 * This fragment is responsible for:
 * - Retrieving user data from the API via the [AccountViewModel].
 * - Observing changes in user information and updating the UI accordingly.
 * - Handling user interactions such as navigating to settings, editing data, viewing request history, and logging out.
 * - Managing session validation and displaying appropriate messages.
 *
 * It extends [PageView] to leverage its navigation and lifecycle management capabilities.
 */
@AndroidEntryPoint
class AccountView : PageView<FragmentAccountBinding, AccountViewModel>(
  FragmentAccountBinding::inflate,
  AccountViewModel::class.java
) {

  override val viewModel : AccountViewModel by viewModels()

  // =============== LIFECYCLE METHODS ===============
  /**
   * Called after the view hierarchy associated with the fragment has been created.
   *
   * Subclasses should implement this method to initialize view components, set up observers,
   * or restore state from [savedInstanceState].
   *
   * @param savedInstanceState If non-null, this fragment is being re-constructed from a previous saved state.
   */
  override fun onCreatePage(savedInstanceState: Bundle?) {
    viewModel.checkSessionStatus()

    this.viewModel.setOnSessionStateChangeListener { isActive ->
      if (isActive) {
        this.viewModel.fetchUserInformation()
      }
    }
  }

  /**
   * @brief Sets all the listeners related to the View.
   *
   * Subclasses should implement this method to observe set their listeners.
   */
  override fun setUpListeners() {
    this.binding.apply {
      // Handle card click: Navigate to settings
      btnSettings.setOnClickListener {
      }
      // Handle card click: Navigate to edit form
      btnEditData.setOnClickListener {
      }
      // Handle card click: View request history
      btnRequestHistory.setOnClickListener {
      }
      // Handle card click: Log out confirmation
      btnLogout.setOnClickListener {
        showLogoutDialog()
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
    viewModel.userInfo.observe(viewLifecycleOwner) { info ->
      binding.tvUsername.text = info.name
      binding.tvEmail.text = info.email
      binding.tvPhoneNumber.text = info.phone
    }

    viewModel.sessionStatus.observe(viewLifecycleOwner) { isActive ->
      // Optional: react to session changes
    }

    viewModel.errorMessage.observe(viewLifecycleOwner) { error ->
      showError(error)
    }
  }

  // =============== DIALOGS ===============

  /**
   * @brief Displays a confirmation dialog for logout
   */
  private fun showLogoutDialog() {
    MaterialAlertDialogBuilder(requireContext())
      .setTitle("Cerrar sesión")
      .setMessage("¿Estás seguro de que deseas cerrar sesión?")
      .setCancelable(false)
      .setPositiveButton("Sí") { dialog, _ ->
        SessionManager.endSession()
        this.listener?.onFragmentEvent("USER_LOGGED_OUT")
        dialog.dismiss()
      }
      .setNegativeButton("No") { dialog, _ ->
        dialog.dismiss()
      }
      .show()
  }
}