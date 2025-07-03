package com.inii.geoterra.development.ui.map

import android.annotation.SuppressLint
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import com.inii.geoterra.development.api.ThermalPoint
import com.inii.geoterra.development.databinding.AnalysisPropertiesPageBinding
import com.inii.geoterra.development.interfaces.PageFragment

/**
 * Fragment displaying detailed information about a thermal point.
 *
 * Shows various properties of a thermal point including coordinates, temperature,
 * and chemical composition. Provides navigation back to the map view.
 */
class AnalysisPropertiesPage : PageFragment<AnalysisPropertiesPageBinding>() {

  /** ViewBinding instance (accessible only between onCreateView and onDestroyView) */
  override val bindingInflater: (LayoutInflater, ViewGroup?, Boolean) ->
  AnalysisPropertiesPageBinding get() = AnalysisPropertiesPageBinding::inflate

  /** Thermal point data source */
  private var thermalPoint: ThermalPoint? = null

  /**
   * Called after the view hierarchy associated with the fragment has been created.
   *
   * Subclasses should implement this method to initialize view components, set up observers,
   * or restore state from [savedInstanceState].
   *
   * @param savedInstanceState If non-null, this fragment is being re-constructed from a previous saved state.
   */
  override fun onPageCreated(savedInstanceState: Bundle?) {
    arguments?.let {
      @Suppress("DEPRECATION")
      thermalPoint = it.getSerializable(ARG_THERMAL_POINT) as? ThermalPoint
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
  override fun onPageViewCreated(
    inflater: LayoutInflater,
    container: ViewGroup?)
  : View {

    updateUI()

    return binding.root
  }

  override fun handleBackPress(): Boolean {
    this.listener?.onFragmentEvent("FINISHED")

    return true
  }

  /**
   * Updates all UI elements with thermal point data.
   */
  @SuppressLint("SetTextI18n")
  private fun updateUI() {
    thermalPoint?.let { point ->
      updateBasicInfo(point)
      updateChemicalProperties(point)
    }
  }

  /**
   * Updates basic information views.
   *
   * @param point Thermal point data source
   */
  private fun updateBasicInfo(point: ThermalPoint) {
//    this.pointName.text = "Análisis: ${point.pointID}"
//
//    // Corrigiendo orden coordenadas para el convertidor si lo requiere
//    val wgs84Coordinates = CoordinateConverter.convertCRT05toWGS84(
//      point.longitude, point.latitude
//    )
//
//    this.latitude.text = "%.7f".format(wgs84Coordinates.y)
//    this.longitude.text = "%.7f".format(wgs84Coordinates.x)
//
//    this.temperature.text = "%.2f °C".format(
//      point.temperature
//    )
  }

  /**
   * Updates chemical property views.
   *
   * @param point Thermal point data source
   */
  private fun updateChemicalProperties(point: ThermalPoint) {
      binding.fieldPhValue.text = "pH: ${point.fieldPh}"
      binding.fieldConditionsValue.text = "${point.fieldCond}"
      binding.labPhValue.text = "pH: ${point.labPh}"
      binding.labConditionsValue.text = "${point.labCond}"
      binding.chlorineValue.text = "Cl: ${point.chlorine}"
      binding.calciumValue.text = "Ca+: ${point.calcium}"
      binding.mgBicarbonateValue.text = "HCO3: ${point.mgBicarbonate}"
      binding.sulfateValue.text = "SO4: ${point.sulfate}"
      binding.ironValue.text = "Fe: ${point.iron}"
      binding.siliconValue.text = "Si: ${point.silicon}"
      binding.boronValue.text = "B: ${point.boron}"
      binding.lithiumValue.text = "Li: ${point.lithium}"
      binding.fluorineValue.text = "F: ${point.fluorine}"
      binding.sodiumValue.text = "Na: ${point.sodium}"
      binding.potassiumValue.text = "K: ${point.potassium}"
      binding.magnesiumIonValue.text = "Mg+: ${point.magnesiumIon}"
  }

  companion object {
    private const val ARG_THERMAL_POINT = "thermalPoint"

    /**
     * Creates a new instance of the fragment with thermal point data.
     *
     * @param thermalPoint Thermal point data to display
     * @return Configured fragment instance
     */
    fun newInstance(thermalPoint: ThermalPoint) = AnalysisPropertiesPage().apply {
      arguments = Bundle().apply {
        putSerializable(ARG_THERMAL_POINT, thermalPoint)
      }
    }
  }
}
