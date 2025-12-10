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
    val thermal = requireArguments().getSerializable(ARG_PARAM1) as ThermalPoint
    this.drawThermalData(thermal)
    return binding.root
  }

  /**
   * Called after the view has been created. Binds LiveData observers to update UI.
   *
   * @param savedInstanceState Optional bundle used to restore previous state
   */
  override fun onCreatePage(savedInstanceState: Bundle?) {
  }

  /**
   * @brief Observes ViewModel LiveData.
   *
   * Subclasses should implement this method to observe ViewModel's LiveData.
   */
  override fun observeViewModel() {}

  /**
   * Updates the basic metadata about the thermal point.
   *
   * @param thermal The thermal point whose basic info is rendered
   */
  @SuppressLint("SetTextI18n")
  private fun drawThermalData(thermal: ThermalPoint) {
    this.binding.apply {
      tvFieldPh.text = "pH: ${thermal.fieldPh}"
      tvFieldConditions.text = "${thermal.fieldCond}"
      tvLabPh.text = "pH: ${thermal.labPh}"
      tvLabConditions.text = "${thermal.labCond}"
      tvChlorine.text = "Cl: ${thermal.chlorine}"
      tvCalcium.text = "Ca+: ${thermal.calcium}"
      tvBicarbonateMg.text = "HCO3: ${thermal.mgBicarbonate}"
      tvSulfate.text = "SO4: ${thermal.sulfate}"
      tvIron.text = "Fe: ${thermal.iron}"
      tvSilicon.text = "Si: ${thermal.silicon}"
      tvBoron.text = "B: ${thermal.boron}"
      tvLithium.text = "Li: ${thermal.lithium}"
      tvFluorine.text = "F: ${thermal.fluorine}"
      tvSodium.text = "Na: ${thermal.sodium}"
      tvPotassium.text = "K: ${thermal.potassium}"
      tvMagnesiumIon.text = "Mg+: ${thermal.magnesiumIon}"
    }
  }

  /**
   * Handles the back button press and notifies the fragment listener.
   *
   * @return true if the event is consumed by this fragment
   */
  override fun handleBackPress(): Boolean {
    listener?.onPageEvent("FINISHED")
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
