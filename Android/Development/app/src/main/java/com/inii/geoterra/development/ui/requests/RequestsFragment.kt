package com.inii.geoterra.development.ui.requests

import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.Toast
import com.inii.geoterra.development.R
import com.inii.geoterra.development.api.AnalysisRequest
import com.inii.geoterra.development.api.RequestsSubmittedResponse
import com.inii.geoterra.development.interfaces.PageFragment
import com.inii.geoterra.development.managers.SessionManager
import com.inii.geoterra.development.ui.elements.RequestSheet
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

/**
 * Fragment for displaying and managing user-submitted analysis requests.
 *
 * Provides functionality to:
 * - Display a list of previously submitted analysis requests
 * - Show a form for submitting new analysis requests
 * - Handle user authentication requirements
 * - Manage fragment transactions for request forms
 *
 * @property submittedRequests List of analysis requests submitted by the user
 * @property requestButton Button for initiating new analysis requests
 * @property formContainer Container frame for displaying request forms
 * @property sheetsLayout LinearLayout container for displaying request sheets
 */
class RequestsFragment : PageFragment() {
  /**
   * List of analysis requests submitted by the current user.
   * Populated from API response and used to render request sheets.
   */
  private var submittedRequests: List<AnalysisRequest> = listOf()

  /**
   * Button that triggers the display of the new request form.
   * Visibility: Always visible when user is authenticated.
   */
  private lateinit var requestButton: Button

  /**
   * FrameLayout container that hosts the request form fragment.
   * Visibility toggled between VISIBLE (when form is shown) and GONE.
   */
  private lateinit var formContainer: FrameLayout

  /**
   * LinearLayout container that holds dynamically generated request sheets.
   * Children are removed and re-added when requests are loaded.
   */
  private lateinit var sheetsLayout: LinearLayout

  /**
   * Creates the fragment view hierarchy.
   *
   * 1. Inflates the fragment layout
   * 2. Initializes UI components
   * 3. Sets up session listener
   * 4. Configures button click handler
   *
   * @param inflater LayoutInflater to inflate views
   * @param container Parent view group for the fragment
   * @param savedInstanceState Previously saved fragment state
   * @return Inflated view hierarchy for the fragment
   */
  override fun onCreateView(
    inflater: LayoutInflater, container: ViewGroup?,
    savedInstanceState: Bundle?
  ) : View {
    // Inflate the fragment layout from XML
    binding = inflater.inflate(
      R.layout.fragment_requests, container, false
    )

    // Initialize all view references
    initViews()

    // Set up session state listener
    setupSessionListener()

    // Configure request button behavior
    setupRequestButton()
    return this.binding
  }

  /**
   * Initializes all UI component references.
   * Called during view creation to establish view-object bindings.
   */
  private fun initViews() {
    // Button for creating new analysis requests
    requestButton = binding.findViewById(R.id.new_request_button)

    // Container for hosting form fragments
    formContainer = binding.findViewById(R.id.form_container)

    // Layout for displaying request summary sheets
    sheetsLayout = binding.findViewById(R.id.sheetsLayout)
  }

  /**
   * Sets up session state listener to reload requests when session becomes active.
   *
   * Triggered when:
   * - User logs in
   * - Session is restored
   */
  private fun setupSessionListener() {
    SessionManager.setOnSessionActiveListener {
      // Load requests when session becomes active
      loadSubmittedRequests()
    }
  }

  /**
   * Configures click listener for the request button.
   * Handles both authenticated and unauthenticated user flows.
   */
  private fun setupRequestButton() {
    requestButton.setOnClickListener {
      // Check authentication status
      if (SessionManager.isSessionActive()) {
        // Show form for authenticated users
        showRequestForm()
      } else {
        // TODO : Delete this line when authentication is implemented
        showRequestForm()
        // Show prompt for unauthenticated users
        showLoginPrompt()
      }
    }
  }

  /**
   * Displays authentication prompt for unauthenticated users.
   * Shown when user attempts to create request without active session.
   */
  private fun showLoginPrompt() {
    this.showToast(
      "Please log in to submit analysis requests",
      Toast.LENGTH_SHORT
    )
  }

  /**
   * Displays the request submission form.
   *
   * 1. Makes form container visible
   * 2. Creates FormFragment instance
   * 3. Replaces container content with form fragment
   * 4. Adds transaction to back stack
   */
  private fun showRequestForm() {
    // Create new form fragment instance
    val formsFragment = FormFragment()

    // Make form container visible
    this.formContainer.visibility = View.VISIBLE

    // Perform fragment transaction
    this.childFragmentManager.beginTransaction()
      .replace(R.id.form_container, formsFragment)
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
    Log.i("FragmentEvent", "Event: $event")
    when (event) {
      "FINISHED" -> {
        // Handle form submission completion
        Log.i("FragmentEvent", "FINISHED")
        this.formContainer.visibility = View.GONE
        this.childFragmentManager.popBackStack()
      }
    }
  }

  /**
   * Loads user-submitted requests from API.
   *
   * Flow:
   * 1. Gets current user email from session
   * 2. Executes API call for submitted requests
   * 3. Handles successful response by updating UI
   * 4. Logs errors for failed requests
   */
  private fun loadSubmittedRequests() {
    // Get current user email (null-checked)
    val userEmail = SessionManager.getUserEmail() ?: return

    // Create API call for user's requests
    val call = this.apiService.getSubmittedRequests(userEmail)

    // Execute API call asynchronously
    call.enqueue(object : Callback<RequestsSubmittedResponse> {
      /**
       * Handles successful API response.
       *
       * @param call Original request call
       * @param response Server response with request data
       */
      override fun onResponse(
        call: Call<RequestsSubmittedResponse>,
        response: Response<RequestsSubmittedResponse>
      ) {
        // Process only successful responses
        if (response.isSuccessful) {
          response.body()?.let { responseBody ->
            // Update local requests collection
            submittedRequests = responseBody.requests

            // Refresh UI on main thread
            updateRequestsUI()
          }
        }
      }

      /**
       * Handles API request failure.
       *
       * @param call Failed request call
       * @param t Throwable containing error information
       */
      override fun onFailure(call: Call<RequestsSubmittedResponse>,
        t: Throwable) {
        Log.e(
          "RequestError",
          "Error loading requests: ${t.message}"
        )
      }
    })
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
  private fun updateRequestsUI() {
    // Remove all existing views
    this.sheetsLayout.removeAllViews()

    // Process each request
    this.submittedRequests.forEachIndexed { index, request ->
      // Create visual representation for request
      addRequestSheet(request)

      // Add spacer between requests (except after last)
      if (index < this.submittedRequests.size - 1) {
        addRequestSpacer()
      }
    }
  }

  /**
   * Creates and adds a visual request sheet to the layout.
   *
   * @param request AnalysisRequest object containing request data
   */
  private fun addRequestSheet(request: AnalysisRequest) {
    // Create request sheet view with request data
    val requestSheet = RequestSheet(
      context = requireContext(),
      latitude = request.latitude,
      longitude = request.longitude,
      date = request.date,
      state = "accepted" // Should come from API response
    )

    // Add to layout
    this.sheetsLayout.addView(requestSheet)
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
    sheetsLayout.addView(spacer)
  }
}