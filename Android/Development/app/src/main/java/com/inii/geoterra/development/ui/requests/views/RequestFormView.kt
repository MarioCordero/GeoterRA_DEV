package com.inii.geoterra.development.ui.requests.views

import android.app.Activity
import android.app.DatePickerDialog
import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.lifecycle.ViewModelProvider
import com.inii.geoterra.development.api.requests.models.AnalysisRequest
import com.inii.geoterra.development.api.requests.models.RequestFormUiState
import com.inii.geoterra.development.api.requests.models.ThermalManifestationType
import com.inii.geoterra.development.databinding.FragmentAnalysisFormBinding
import com.inii.geoterra.development.device.FragmentPermissionRequester
import com.inii.geoterra.development.interfaces.PageView
import com.inii.geoterra.development.ui.elements.SpringForm
import com.inii.geoterra.development.ui.elements.TerrainForm
import com.inii.geoterra.development.ui.requests.models.RequestFormViewModel
import dagger.hilt.android.AndroidEntryPoint
import timber.log.Timber
import javax.inject.Inject

@AndroidEntryPoint
class RequestFormView : PageView<FragmentAnalysisFormBinding, RequestFormViewModel>(
  FragmentAnalysisFormBinding::inflate,
  RequestFormViewModel::class.java
) {
  @Inject
  /** Dependency injected factory instance */
  lateinit var assistedFactory : RequestFormViewModel.Factory

  /** ViewModelFactory instance to be used by the ViewModel */
  override val viewModelFactory: ViewModelProvider.Factory
    get() = createAssistedViewModelFactory {
      // Obtener el AnalysisRequest de los argumentos
      val requestPayloadPlaceholder = requireArguments().getParcelable<AnalysisRequest>(ARG_PARAM1)!!
      assistedFactory.create(requestPayloadPlaceholder)
    }

  companion object {
    /** Class argument key for analysis request data */
    private const val ARG_PARAM1 = "request"

    /**
     * Creates a new instance of the fragment with analysis request data.
     *
     * @param payloadPlaceholder Analysis request data to use
     * @return Configured fragment instance
     */
    fun newInstance(payloadPlaceholder: AnalysisRequest) = RequestFormView().apply {
      arguments = Bundle().apply {
        putParcelable(ARG_PARAM1, payloadPlaceholder)
      }
    }
  }

  private lateinit var terrainForm: TerrainForm
  private lateinit var springForm: SpringForm

  private val pickImageLauncher = registerForActivityResult(
    ActivityResultContracts.StartActivityForResult()
  ) { result ->
    if (result.resultCode == Activity.RESULT_OK) {
      result.data?.data?.let { uri ->
        viewModel.handleImageUri(uri)
      }
    }
  }

  private val calendar = java.util.Calendar.getInstance()
  private val calendarListener = DatePickerDialog.OnDateSetListener { _, year, month, dayOfMonth ->
    saveCurrentFormState()
    viewModel.updateDate(year, month, dayOfMonth)
  }

  /**
   * Called after the view hierarchy associated with the fragment has been created.
   *
   * Subclasses should implement this method to initialize view components, set up observers,
   * or restore state from [savedInstanceState].
   *
   * @param savedInstanceState If non-null, this fragment is being re-constructed from a previous saved state.
   */
  override fun onCreatePage(savedInstanceState : Bundle?) {
    if (!this.viewModel.isGPSManagerInitialized()) {
      this.viewModel.initLocationService(FragmentPermissionRequester(this))
    }
  }

  override fun onCreatePageView(inflater: LayoutInflater, container: ViewGroup?): View {
    setUpView()
    viewModel.formState.value?.let { renderForm(it) }
    return binding.root
  }

  private fun setUpView() {
    terrainForm = TerrainForm(requireContext())
    springForm = SpringForm(requireContext())
    binding.viewSwitcherForm.addView(terrainForm)
    binding.viewSwitcherForm.addView(springForm)
  }

  override fun setUpListeners() {
    // Terrain type toggle group listener
    binding.toggleGroupTerrainType.addOnButtonCheckedListener { _,
      checkedId, isChecked ->
      if (isChecked) {
        Timber.d("Terrain type checked: $checkedId")
        when (checkedId) {
          this.binding.btnTerrainLand.id -> showManifestationForm(0)
          this.binding.btnTerrainSpring.id -> showManifestationForm(1)
        }
      }
    }

    binding.btnLocationGPS.isChecked = false
    binding.btnLocationPhoto.isChecked = false

    // Location button click
    this.binding.btnLocationGPS.setOnClickListener {
      saveCurrentFormState()
      viewModel.updateCoordinatesFromLocation()
    }

    // Image button click
    this.binding.btnLocationPhoto.setOnClickListener {
      if (viewModel.isGalleryPermissionReady()) {
        openGallery()
      }
    }

    // Date picker setup
    this.binding.etDate.setOnClickListener {
      showDatePicker()
    }

    // Send button click
    binding.btnSendRequest.setOnClickListener {
      saveCurrentFormState()
      viewModel.submitRequest()
    }
  }

  override fun observeViewModel() {
    viewModel.formState.observe(viewLifecycleOwner) { state ->
      // Render the UI based on the current state
      renderForm(state)
    }

    viewModel.identifierError.observe(viewLifecycleOwner) { error ->
      binding.tilIdentifier.error = error
    }

    viewModel.dateError.observe(viewLifecycleOwner) { error ->
      binding.tilDate.error = error
    }

    viewModel.toastMessage.observe(viewLifecycleOwner) { message ->
      message?.let {
        Toast.makeText(requireContext(), it, Toast.LENGTH_SHORT).show()
      }
    }

    viewModel.isSuccessful.observe(viewLifecycleOwner) { result ->
      if (result == true) {
        listener?.onPageEvent("FORM_FINISHED")
      }
    }

    viewModel.galleryPermissionRequired.observe(viewLifecycleOwner) {
        required ->
      if (required == true) { // Request permission here, or notify user
        this.viewModel.initGalleryService(FragmentPermissionRequester(this))
      }
    }
  }

  /**
   * Renders the entire form from the UI state.
   */
  private fun renderForm(state: RequestFormUiState) {
    Timber.i("Rendering form state: $state")
    println("Rendering form state: $state")

    binding.etIdentifier.setText(state.identifier)
    binding.etOwnerName.setText(state.ownerName)
    binding.etOwnerContact.setText(state.ownerContact)
    binding.etCurrentUse.setText(state.currentUsage)
    binding.etAdditionalDetails.setText(state.details)
    binding.etDate.setText(state.date)

    if (state.manifestationType == ThermalManifestationType.FUMAROLE) {
      binding.toggleGroupTerrainType.check(binding.btnTerrainLand.id)
      showManifestationForm(0)
    } else {
      binding.toggleGroupTerrainType.check(binding.btnTerrainSpring.id)
      showManifestationForm(1)
    }
  }

  private fun saveCurrentFormState() {
    viewModel.saveFormState(
      identifier = binding.etIdentifier.text.toString(),
      ownerName = binding.etOwnerName.text.toString(),
      ownerContact = binding.etOwnerContact.text.toString(),
      currentUsage = binding.etCurrentUse.text.toString(),
      details = binding.etAdditionalDetails.text.toString()
    )
  }

  private fun showManifestationForm(index: Int) {
    val viewSwitcher = binding.viewSwitcherForm
    if (index in 0 until viewSwitcher.childCount) {
      viewSwitcher.displayedChild = index
      viewSwitcher.requestLayout()
    }
  }

  private fun showDatePicker() {
    DatePickerDialog(
      requireContext(),
      android.R.style.Theme_Material_Light_Dialog,
      calendarListener,
      calendar.get(java.util.Calendar.YEAR),
      calendar.get(java.util.Calendar.MONTH),
      calendar.get(java.util.Calendar.DAY_OF_MONTH)
    ).show()
  }

  private fun openGallery() {
    val intent = Intent(Intent.ACTION_PICK).apply { type = "image/*" }
    pickImageLauncher.launch(intent)
  }

  /**
   * Deprecated method to forward permission results to managers.
   */
  @Deprecated("Deprecated in Java")
  override fun onRequestPermissionsResult(
    requestCode: Int,
    permissions: Array<out String>,
    grantResults: IntArray
  ) {
    super.onRequestPermissionsResult(requestCode, permissions, grantResults)
    this.viewModel.onPermissionResult(
      requestCode, grantResults, FragmentPermissionRequester(this)
    )
  }
}