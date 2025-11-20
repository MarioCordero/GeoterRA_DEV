package com.inii.geoterra.development.ui.home.views

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.viewModels
import androidx.lifecycle.ViewModelProvider
import com.inii.geoterra.development.databinding.FragmentHomeBinding
import com.inii.geoterra.development.interfaces.PageView
import com.inii.geoterra.development.ui.home.models.HomeViewModel
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject

/**
 * @brief Primary landing screen fragment for application home view
 *
 * Serves as the main entry point UI after authentication. Currently implements
 * basic layout inflation with expansion capabilities for:
 * - Dashboard metrics
 * - Quick actions
 * - Recent activity
 *
 * Inherits PageView lifecycle management capabilities.
 */
@AndroidEntryPoint
class HomeView : PageView<FragmentHomeBinding, HomeViewModel>(
  FragmentHomeBinding::inflate,
  HomeViewModel::class.java
) {

  override val viewModel : HomeViewModel by viewModels()

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

    return this.binding.root
  }

  override fun observeViewModel() {
  }
}
