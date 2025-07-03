package com.inii.geoterra.development.ui.home

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import com.inii.geoterra.development.R
import com.inii.geoterra.development.databinding.FragmentHomeBinding
import com.inii.geoterra.development.databinding.FragmentLoginBinding
import com.inii.geoterra.development.interfaces.PageFragment

/**
 * @brief Primary landing screen fragment for application home view
 *
 * Serves as the main entry point UI after authentication. Currently implements
 * basic layout inflation with expansion capabilities for:
 * - Dashboard metrics
 * - Quick actions
 * - Recent activity
 *
 * Inherits PageFragment lifecycle management capabilities.
 */
class HomeFragment : PageFragment<FragmentHomeBinding>() {
  /** Inflated view hierarchy reference for home page */
  override val bindingInflater : (LayoutInflater, ViewGroup?, Boolean) ->
  FragmentHomeBinding get() = FragmentHomeBinding::inflate

  // =============== LIFECYCLE METHODS ===============
  /**
   * Called after the view hierarchy associated with the fragment has been created.
   *
   * Subclasses should implement this method to initialize view components, set up observers,
   * or restore state from [savedInstanceState].
   *
   * @param savedInstanceState If non-null, this fragment is being re-constructed from a previous saved state.
   */
  override fun onPageCreated(savedInstanceState: Bundle?) {}

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
  override fun onPageViewCreated(inflater : LayoutInflater,
    container : ViewGroup?
  ) : View {

    return this.binding.root
  }
}
