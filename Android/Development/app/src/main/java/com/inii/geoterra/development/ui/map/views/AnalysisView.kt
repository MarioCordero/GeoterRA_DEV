package com.inii.geoterra.development.ui.map.views

import android.annotation.SuppressLint
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.lifecycle.ViewModelProvider
import com.inii.geoterra.development.api.ThermalPoint
import com.inii.geoterra.development.databinding.FragmentAnalysisBinding
import com.inii.geoterra.development.interfaces.PageView
import com.inii.geoterra.development.ui.map.models.AnalysisViewModel
import com.inii.geoterra.development.ui.map.views.ThermalView.Companion
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject

/**
 * @brief Fragment displaying detailed information about a thermal point
 *
 * Connects with [AnalysisViewModel] to observe and present the data.
 * All UI rendering is done reactively via LiveData observers.
 *
 * @property binding View binding instance for this fragment
 * @property viewModel ViewModel instance injected by the generic base class
 */
@AndroidEntryPoint
class AnalysisView : PageView<FragmentAnalysisBinding, AnalysisViewModel>(
  FragmentAnalysisBinding::inflate,
  AnalysisViewModel::class.java
) {

  @Inject
  /** Dependency injected factory instance */
  lateinit var assistedFactory : AnalysisViewModel.Factory

  /** ViewModelFactory instance to be used by the ViewModel */
  override val viewModelFactory: ViewModelProvider.Factory
    get() = createAssistedViewModelFactory {
      val thermal = requireArguments().getSerializable(ARG_PARAM1) as
        ThermalPoint
      assistedFactory.create(thermal)
    }

  /** Holds the selected thermal point */
  lateinit var thermal: ThermalPoint

  companion object {
    /** Class argument key for thermal data */
    private const val ARG_PARAM1 = "thermal"

    /**
     * Creates a new instance of the fragment with thermal data.
     *
     * @param selectedThermal Thermal data to display
     * @return Configured fragment instance
     */
    fun newInstance(selectedThermal: ThermalPoint) = AnalysisView().apply {
      arguments = Bundle().apply {
        putSerializable(ARG_PARAM1, selectedThermal)
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

    this.drawThermalData(this.viewModel.thermal.value!!)

    return binding.root
  }

  /**
   * Called after the view has been created. Binds LiveData observers to update UI.
   *
   * @param savedInstanceState Optional bundle used to restore previous state
   */
  override fun onCreatePage(savedInstanceState: Bundle?) {
    // Recover thermal point from arguments and assign it to ViewModel

  }

  /**
   * @brief Observes ViewModel LiveData.
   *
   * Subclasses should implement this method to observe ViewModel's LiveData.
   */
  override fun observeViewModel() {
    viewModel.thermal.observe(viewLifecycleOwner) { point ->
    }
  }

  /**
   * Updates the basic metadata about the thermal point.
   *
   * @param thermal The thermal point whose basic info is rendered
   */
  @SuppressLint("SetTextI18n")
  private fun drawThermalData(thermal: ThermalPoint) {
    binding.tvFieldPh.text = "pH: ${thermal.fieldPh}"
    binding.tvFieldConditions.text = "${thermal.fieldCond}"
    binding.tvLabPh.text = "pH: ${thermal.labPh}"
    binding.tvLabConditions.text = "${thermal.labCond}"
    binding.tvChlorine.text = "Cl: ${thermal.chlorine}"
    binding.tvCalcium.text = "Ca+: ${thermal.calcium}"
    binding.tvBicarbonateMg.text = "HCO3: ${thermal.mgBicarbonate}"
    binding.tvSulfate.text = "SO4: ${thermal.sulfate}"
    binding.tvIron.text = "Fe: ${thermal.iron}"
    binding.tvSilicon.text = "Si: ${thermal.silicon}"
    binding.tvBoron.text = "B: ${thermal.boron}"
    binding.tvLithium.text = "Li: ${thermal.lithium}"
    binding.tvFluorine.text = "F: ${thermal.fluorine}"
    binding.tvSodium.text = "Na: ${thermal.sodium}"
    binding.tvPotassium.text = "K: ${thermal.potassium}"
    binding.tvMagnesiumIon.text = "Mg+: ${thermal.magnesiumIon}"
  }

  /**
   * Handles the back button press and notifies the fragment listener.
   *
   * @return true if the event is consumed by this fragment
   */
  override fun handleBackPress(): Boolean {
    listener?.onFragmentEvent("FINISHED")
    return true
  }

  /**
   * @brief Sets all the listeners related to the View.
   *
   * Subclasses should implement this method to observe set their listeners.
   */
  override fun setUpListeners() {

  }
}
