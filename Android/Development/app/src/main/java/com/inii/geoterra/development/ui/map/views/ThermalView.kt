package com.inii.geoterra.development.ui.map.views

import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.lifecycle.ViewModelProvider
import com.inii.geoterra.development.api.ThermalPoint
import com.inii.geoterra.development.databinding.FragmentThermalBinding
import com.inii.geoterra.development.device.CoordinateConverter
import com.inii.geoterra.development.interfaces.PageView
import com.inii.geoterra.development.ui.map.models.AnalysisViewModel
import com.inii.geoterra.development.ui.map.models.ThermalViewModel
import dagger.hilt.android.AndroidEntryPoint
import org.osmdroid.util.GeoPoint
import timber.log.Timber
import javax.inject.Inject

/**
 * Fragment displaying detailed information about a thermal point.
 *
 * Shows various properties of a thermal point including coordinates, temperature,
 * and chemical composition. Provides navigation back to the map view.
 */
@AndroidEntryPoint
class ThermalView : PageView<FragmentThermalBinding, ThermalViewModel>(
  FragmentThermalBinding::inflate,
  ThermalViewModel::class.java
) {

  companion object {
    /** Class argument key for thermal data */
    private const val ARG_PARAM1 = "thermal"

    /**
     * Creates a new instance of the fragment with thermal data.
     *
     * @param selectedThermal Thermal data to display
     * @return Configured fragment instance
     */
    fun newInstance(selectedThermal: ThermalPoint) = ThermalView().apply {
      arguments = Bundle().apply {
        putSerializable(ARG_PARAM1, selectedThermal)
      }
    }
  }

  @Inject
  /** Dependency injected factory instance */
  lateinit var assistedFactory : ThermalViewModel.Factory

  /** ViewModelFactory instance (subclasses use it directly) */
  override val viewModelFactory: ViewModelProvider.Factory
    get() = createAssistedViewModelFactory {
      val thermal = requireArguments().getSerializable(ARG_PARAM1) as ThermalPoint
      assistedFactory.create(thermal)
    }

  override fun onCreatePage(savedInstanceState : Bundle?) {
  }

  /**
   * @brief Sets all the listeners related to the View.
   *
   * Subclasses should implement this method to observe set their listeners.
   */
  override fun setUpListeners() {
    this.binding.btnAnalysis.setOnClickListener {
      this.prepareFragment(this.viewModel.thermal.value!!)
    }
  }

  /**
   * @brief Observes ViewModel LiveData.
   *
   * Subclasses should implement this method to observe ViewModel's LiveData.
   */
  override fun observeViewModel() {}

  override fun onCreatePageView(inflater : LayoutInflater,
    container : ViewGroup?
  ) : View {
    this.drawThermalData(this.viewModel.thermal.value!!)

    return this.binding.root
  }

  /**
   * @brief Handles the events triggered by child fragments.
   *
   * @param event Name of the event
   * @param data Optional data associated with the event
   */
  override fun onFragmentEvent(event: String, data: Any?) {
    Timber.i("Event: $event")
    when (event) {
      "FINISHED" -> {
        // Handle form submission completion
        Timber.i("FINISHED")
        this.childFragmentManager.popBackStack()
        this.binding.fragmentContainer.visibility = View.GONE
      }
    }
  }

  /**
   * Prepares fragment transition for thermal point detail view.
   *
   * @param pointValue Thermal point data to display
   */
  private fun prepareFragment(pointValue: ThermalPoint) {
    Timber.i("Preparing fragment")
    this.binding.fragmentContainer.visibility = View.VISIBLE

    val analysisPage = AnalysisView.newInstance(pointValue)
    this.childFragmentManager.beginTransaction()
      .replace(this.binding.fragmentContainer.id, analysisPage)
      .addToBackStack(null)
      .commit()
  }

  /**
   * Updates basic information views.
   *
   * @param point Thermal point data source
   */
  private fun drawThermalData(point: ThermalPoint) {
    this.binding.tvIdentifier.text = "Análisis: ${point.id}"

    // Corrigiendo orden coordenadas para el convertidor si lo requiere
    val wgs84Coordinates = CoordinateConverter.convertCRT05toWGS84(
      point.longitude, point.latitude
    )

    this.binding.tvLatitude.text = "%.7f".format(wgs84Coordinates.y)
    this.binding.tvLongitude.text = "%.7f".format(wgs84Coordinates.x)

    this.binding.tvTemperature.text = "%.2f °C".format(
      point.temperature
    )

    this.binding.tvPh.text = point.labPh.toString()

    this.binding.tvConductivity.text = point.labCond.toString()
  }
}
