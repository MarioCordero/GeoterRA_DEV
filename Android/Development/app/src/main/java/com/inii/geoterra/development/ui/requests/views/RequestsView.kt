package com.inii.geoterra.development.ui.requests.views

import android.graphics.Bitmap
import android.graphics.BitmapFactory
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
import org.osmdroid.util.GeoPoint
import androidx.core.graphics.createBitmap
import com.inii.geoterra.development.R

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

  override fun onShow() {
    super.onShow()
    this.drawSubmittedRequests()
  }

  override fun observeViewModel() {
    this.viewModel.errorMessage.observe(viewLifecycleOwner) { error ->
      this.showToast(error, Toast.LENGTH_SHORT)
    }

    this.viewModel.submittedRequests.observe(viewLifecycleOwner) {
      this.drawSubmittedRequests()
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
  override fun onPageEvent(event: String, data: Any?) {
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

  fun drawSubmittedRequests() {

    val requests = this.viewModel.submittedRequests.value
    this.binding.layoutSubmittedRequests.removeAllViews()

    requests?.forEachIndexed { index, request ->

      // 1. Elegir imagen desde drawable
      val photo = when (request.type) {
        "Manantial" -> BitmapFactory.decodeResource(
          resources, R.drawable.hotspring_image
        )
        "fumarole" -> BitmapFactory.decodeResource(
          resources, R.drawable.fumaroles_image
        )
        else -> BitmapFactory.decodeResource(
          resources, R.drawable.hotspring_image
        )
      }

      // TODO: Eliminar el type escrito cuando se implemente en backend..

      // 2. Crear RequestSheet SOLO con esa imagen
      val sheet = RequestSheet(
        context = requireContext(),
        photoBitmap = photo,
        name = "SOLI-00${request.id}",
        type = "Manantial",
        region = request.region,
        latitude = request.latitude,
        longitude = request.longitude,
        date = request.date,
        state = "Pendiente"
      )

      this.binding.layoutSubmittedRequests.addView(sheet)

      if (index < requests.size - 1) {
        this.addRequestSpacer()
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