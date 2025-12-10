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
import androidx.fragment.app.viewModels
import com.inii.geoterra.development.databinding.FragmentAnalysisFormBinding
import com.inii.geoterra.development.interfaces.PageView
import com.inii.geoterra.development.ui.elements.SpringForm
import com.inii.geoterra.development.ui.elements.TerrainForm
import com.inii.geoterra.development.ui.requests.models.AnalysisFormViewModel
import dagger.hilt.android.AndroidEntryPoint
import timber.log.Timber

@AndroidEntryPoint
class AnalysisFormView : PageView<FragmentAnalysisFormBinding, AnalysisFormViewModel>(
  FragmentAnalysisFormBinding::inflate,
  AnalysisFormViewModel::class.java
) {
  private lateinit var terrainForm: TerrainForm
  private lateinit var springForm: SpringForm

  override val viewModel: AnalysisFormViewModel by viewModels()

  private val pickImageLauncher = registerForActivityResult(
    ActivityResultContracts.StartActivityForResult()
  ) { result ->
    if (result.resultCode == Activity.RESULT_OK) {
      result.data?.data?.let { uri ->
        viewModel.handleImageUri(uri)
      }
    }
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
      this.viewModel.initLocationService(this)
    }
  }

  override fun onCreatePageView(inflater: LayoutInflater, container: ViewGroup?): View {
    initForms()
    return binding.root
  }

  private fun initForms() {
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
          this.binding.btnTerrainLand.id -> showForm(0)
          this.binding.btnTerrainSpring.id -> showForm(1)
        }
      }
    }

    binding.btnLocationGPS.isChecked = false
    binding.btnLocationPhoto.isChecked = false

    // Location button click
    this.binding.btnLocationGPS.setOnClickListener {
      viewModel.updateCoordinatesFromLocation(this)
    }

    // Image button click
    this.binding.btnLocationPhoto.setOnClickListener {
      if (viewModel.isGalleryPermissionReady()) {
        openGallery()
      }
    }

    // Date picker setup
    this.binding.etDate.setText(viewModel.dateInput.value)

    this.binding.etDate.setOnClickListener {
      showDatePicker()
    }

    // Send button click
    this.binding.btnSendRequest.setOnClickListener {
      if (viewModel.validateAndPopulateFormData(
          binding.etIdentifier.text.toString(),
          binding.etOwnerName.text.toString(),
          binding.etCurrentUse.text.toString(),
          binding.etAdditionalDetails.text.toString(),
          binding.viewSwitcherForm.currentView == terrainForm)
      ) {
        this.viewModel.sendRequest()
      }
    }
  }

  private fun showForm(index: Int) {
    val viewSwitcher = binding.viewSwitcherForm
    if (index in 0 until viewSwitcher.childCount) {
      viewSwitcher.displayedChild = index
      viewSwitcher.requestLayout()
    }
  }

  private fun showDatePicker() {
    val calendar = java.util.Calendar.getInstance()
    val listener = DatePickerDialog.OnDateSetListener { _, year, month, dayOfMonth ->
      viewModel.updateDate(year, month, dayOfMonth)
    }
    DatePickerDialog(
      requireContext(),
      android.R.style.Theme_Material_Light_Dialog,
      listener,
      calendar.get(java.util.Calendar.YEAR),
      calendar.get(java.util.Calendar.MONTH),
      calendar.get(java.util.Calendar.DAY_OF_MONTH)
    ).show()
  }

  private fun openGallery() {
    val intent = Intent(Intent.ACTION_PICK).apply {
      type = "image/*"
    }
    pickImageLauncher.launch(intent)
  }

  override fun observeViewModel() {
    viewModel.dateInput.observe(viewLifecycleOwner) { date ->
      binding.etDate.setText(date)
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
//        this.viewModel.clearToast()
      }
    }

    viewModel.formSubmitted.observe(viewLifecycleOwner) { submitted ->
      if (submitted == true) {
        listener?.onPageEvent("FORM_FINISHED", true)
      }
    }

    viewModel.galleryPermissionRequired.observe(viewLifecycleOwner) {
      required ->
      if (required == true) { // Request permission here, or notify user
        this.viewModel.initGalleryService(this)
      }
    }

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
      requestCode, grantResults, this
    )
  }
}