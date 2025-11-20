package com.inii.geoterra.development.ui.requests.views

import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.LinearLayout
import android.widget.Toast
import androidx.core.view.size
import androidx.fragment.app.viewModels
import com.inii.geoterra.development.api.AnalysisRequest
import com.inii.geoterra.development.databinding.FragmentRequestsBinding
import com.inii.geoterra.development.interfaces.PageView
import com.inii.geoterra.development.managers.SessionManager
import com.inii.geoterra.development.ui.elements.RequestSheet
import com.inii.geoterra.development.ui.requests.models.RequestsViewModel
import dagger.hilt.android.AndroidEntryPoint

/**
 * Fragment for displaying and managing user-submitted analysis requests.
 *
 * Provides functionality to:
 * - Display a list of previously submitted analysis requests
 * - Show a form for submitting new analysis requests
 * - Handle user authentication requirements
 * - Manage fragment transactions for request forms
 *
 */
@AndroidEntryPoint
class RequestsView : PageView<FragmentRequestsBinding, RequestsViewModel>(
  FragmentRequestsBinding::inflate,
  RequestsViewModel::class.java
) {

  override val viewModel : RequestsViewModel by viewModels()

  override fun onCreatePageView(inflater : LayoutInflater,
    container : ViewGroup?
  ) : View {

    return this.binding.root
  }

  override fun onCreatePage(savedInstanceState : Bundle?) {

  }

  override fun onPageViewCreated(view : View, savedInstanceState : Bundle?) {

    this.viewModel.setOnSessionStateChangeListener { isActive ->
      if (isActive) {
        this.viewModel.fetchSubmittedRequests()
      } else {
        if (this.binding.layoutSubmittedRequests.size != 0) {
          this.binding.layoutSubmittedRequests.removeAllViews()
        }
      }
    }
  }

  override fun observeViewModel() {
    this.viewModel.errorMessage.observe(viewLifecycleOwner) { error ->
      this.showToast(error, Toast.LENGTH_SHORT)
    }

    this.viewModel.submittedRequests.observe(viewLifecycleOwner) { requests ->
      this.drawSubmittedRequests(requests)
    }
  }

  override fun setUpListeners() {
    this.binding.btnCreateRequest.setOnClickListener {
      // Check authentication status
      if (SessionManager.isSessionActive()) {
        // Show form for authenticated users
        this.showRequestForm()
      } else {
        // Show prompt for unauthenticated users
        this.showLoginPrompt()
      }
    }
  }

  /**
   * Displays authentication prompt for unauthenticated users.
   * Shown when user attempts to create request without active session.
   */
  private fun showLoginPrompt() {
    this.showToast(
      "Por favor inicie sesión para crear una solicitud de análisis",
      Toast.LENGTH_SHORT
    )
  }

  /**
   * Displays the request submission form.
   *
   * 1. Makes form container visible
   * 2. Creates AnalysisFormView instance
   * 3. Replaces container content with form fragment
   * 4. Adds transaction to back stack
   */
  private fun showRequestForm() {
    // Create new form fragment instance
    val formsFragment = AnalysisFormView()

    // Make form container visible
    this.binding.containerForm.visibility = View.VISIBLE

    // Perform fragment transaction
    this.childFragmentManager.beginTransaction()
      .replace(this.binding.containerForm.id, formsFragment)
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
    Log.i("FragmentEvent", "Event: $event, Data: $data")
    when (event) {
      "FORM_FINISHED" -> {
        // Handle form submission completion
        Log.i("FragmentEvent", "FORM_FINISHED, $data")
        this.binding.containerForm.visibility = View.GONE
        this.childFragmentManager.popBackStack()

        this.viewModel.fetchSubmittedRequests()
      }
    }
  }

  /**
   * Updates UI with current list of submitted requests.
   *
   * Steps:
   * 1. Clears existing views
   * 2. Iterates through submitted requests
   * 3. Creates request sheet for each request
   * 4. Adds visual spacer between requests
   * 5. Adds all components to layout
   */
  private fun drawSubmittedRequests(summitedRequests : List<AnalysisRequest>?) {
    // Remove all existing views
    this.binding.layoutSubmittedRequests.removeAllViews()

    summitedRequests?.forEachIndexed { index, request ->
      // Create visual representation for request
      val requestSheet = RequestSheet(
        context = requireContext(),
        latitude = request.latitude,
        longitude = request.longitude,
        date = request.date,
        state = "accepted" // Should come from API response
      )

      // Add to layout
      this.binding.layoutSubmittedRequests.addView(requestSheet)

      // Add spacer between requests (except after last)
      if (index < summitedRequests.size - 1) {
        addRequestSpacer()
      }
    }

  }

  /**
   * Adds visual spacer between request sheets.
   * Creates an empty view with fixed height for separation.
   */
  private fun addRequestSpacer() {
    // Create spacer view
    val spacer = View(requireContext())

    // Configure layout parameters (match width, fixed height)
    val layoutParams = LinearLayout.LayoutParams(
      LinearLayout.LayoutParams.MATCH_PARENT,
      40 // 40dp height
    )
    spacer.layoutParams = layoutParams

    // Add to layout
    this.binding.layoutSubmittedRequests.addView(spacer)
  }
}