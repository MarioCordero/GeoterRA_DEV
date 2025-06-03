package com.inii.geoterra.development.ui.map

import android.annotation.SuppressLint
import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.TextView
import com.inii.geoterra.development.R
import com.inii.geoterra.development.api.ThermalPoint
import com.inii.geoterra.development.device.CoordinateConverter
import com.inii.geoterra.development.interfaces.PageFragment
import org.osmdroid.util.GeoPoint

/**
 * Fragment displaying detailed information about a thermal point.
 *
 * Shows various properties of a thermal point including coordinates, temperature,
 * and chemical composition. Provides navigation back to the map view.
 */
class ThermalPointInfoFragment : PageFragment() {

  private var thermalPoint: ThermalPoint? = null

  // UI Components
  private lateinit var backButton: Button
  private lateinit var thermalPointTextView: TextView
  private lateinit var coordinatesTextView: TextView
  private lateinit var temperatureTextView: TextView

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    arguments?.let {
      @Suppress("DEPRECATION")
      thermalPoint = it.getSerializable(ARG_THERMAL_POINT) as? ThermalPoint
    }
  }

  override fun onCreateView(
    inflater: LayoutInflater,
    container: ViewGroup?,
    savedInstanceState: Bundle?
  ): View {
    binding = inflater.inflate(R.layout.fragment_thermal_point_info, container, false)
    initViews()
    setupBackButton()
    updateUI()
    return binding
  }

  /**
   * Initializes all view references.
   */
  private fun initViews() {
    backButton = binding.findViewById(R.id.go_back_button)
  }

  /**
   * Configures the back button click listener.
   */
  private fun setupBackButton() {
    backButton.setOnClickListener {
      thermalPoint?.let {
        Log.i("Navigation", "Exiting point info: ${it.pointID}")
        notifyMapToCenterOnPoint(it)
      }
    }
  }

  /**
   * Notifies the parent fragment to center on this thermal point.
   *
   * @param point Thermal point to center on
   */
  private fun notifyMapToCenterOnPoint(point: ThermalPoint) {
    listener?.onFragmentEvent(
      "FINISHED",
      GeoPoint(point.latitude, point.longitude)
    )
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
    thermalPointTextView.text = "Thermal Point: ${point.pointID}"

    val wsg84Coordinates = CoordinateConverter.convertCRT05toWGS84(
      point.latitude,
      point.longitude
    )
    coordinatesTextView.text =
      "Latitude: %.7f\nLongitude: %.7f".format(wsg84Coordinates.x, wsg84Coordinates.y)

    temperatureTextView.text = "Temperature: ${point.temperature}"
  }

  /**
   * Updates chemical property views.
   *
   * @param point Thermal point data source
   */
  private fun updateChemicalProperties(point: ThermalPoint) {
    updateTextView(R.id.field_ph, "Field pH: ${point.fieldPh}")
    updateTextView(R.id.field_conditions, "Field Cond: ${point.fieldCond}")
    updateTextView(R.id.lab_ph, "Lab pH: ${point.labPh}")
    updateTextView(R.id.lab_conditions, "Lab Cond: ${point.labCond}")
    updateTextView(R.id.chlorine, "Cl: ${point.chlorine}")
    updateTextView(R.id.calcium, "Ca+: ${point.calcium}")
    updateTextView(R.id.mg_bicarbonate, "HCO3: ${point.mgBicarbonate}")
    updateTextView(R.id.sulfate, "SO4: ${point.sulfate}")
    updateTextView(R.id.iron, "Fe: ${point.iron}")
    updateTextView(R.id.silicon, "Si: ${point.silicon}")
    updateTextView(R.id.boron, "B: ${point.boron}")
    updateTextView(R.id.lithium, "Li: ${point.lithium}")
    updateTextView(R.id.fluorine, "F: ${point.fluorine}")
    updateTextView(R.id.sodium, "Na: ${point.sodium}")
    updateTextView(R.id.potassium, "K: ${point.potassium}")
    updateTextView(R.id.magnesium_Ion, "Mg+: ${point.magnesiumIon}")
  }

  /**
   * Updates a TextView with the specified text.
   *
   * @param viewId Resource ID of the TextView
   * @param text Text to display
   */
  private fun updateTextView(viewId: Int, text: String) {
    binding.findViewById<TextView>(viewId)?.text = text
  }

  companion object {
    private const val ARG_THERMAL_POINT = "thermalPoint"

    /**
     * Creates a new instance of the fragment with thermal point data.
     *
     * @param thermalPoint Thermal point data to display
     * @return Configured fragment instance
     */
    fun newInstance(thermalPoint: ThermalPoint) = ThermalPointInfoFragment().apply {
      arguments = Bundle().apply {
        putSerializable(ARG_THERMAL_POINT, thermalPoint)
      }
    }
  }
}