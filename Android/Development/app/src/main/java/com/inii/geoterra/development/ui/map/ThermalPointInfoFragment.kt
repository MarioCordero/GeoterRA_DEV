package com.inii.geoterra.development.ui.map

import android.annotation.SuppressLint
import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.TextView
import androidx.activity.OnBackPressedCallback
import com.inii.geoterra.development.R
import com.inii.geoterra.development.api.ThermalPoint
import com.inii.geoterra.development.databinding.FragmentLoginBinding
import com.inii.geoterra.development.databinding.FragmentThermalPointInfoBinding
import com.inii.geoterra.development.device.CoordinateConverter
import com.inii.geoterra.development.device.GPSManager
import com.inii.geoterra.development.interfaces.PageFragment
import org.osmdroid.util.GeoPoint

/**
 * Fragment displaying detailed information about a thermal point.
 *
 * Shows various properties of a thermal point including coordinates, temperature,
 * and chemical composition. Provides navigation back to the map view.
 */
class ThermalPointInfoFragment : PageFragment<FragmentThermalPointInfoBinding>() {

  /** Inflated view hierarchy reference for the thermal point info fragment */
  override val bindingInflater : (LayoutInflater, ViewGroup?, Boolean) ->
  FragmentThermalPointInfoBinding get() = FragmentThermalPointInfoBinding::inflate

  private var thermalPoint: ThermalPoint? = null

  // UI Components
  private lateinit var pointName: TextView
  private lateinit var latitude: TextView
  private lateinit var longitude: TextView
  private lateinit var temperature: TextView

  private lateinit var chemistryAnalysisButton : Button

  override fun onPageViewCreated(inflater : LayoutInflater,
    container : ViewGroup?
  ) : View {
    initViews()
    updateUI()

    return this.binding.root
  }

  override fun onPageCreated(savedInstanceState : Bundle?) {
    arguments?.let {
      @Suppress("DEPRECATION")
      thermalPoint = it.getSerializable(ARG_THERMAL_POINT) as? ThermalPoint
    }
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
    Log.i("ThermalPointInfoFragment", "Preparing fragment")
    this.binding.fragmentContainer.visibility = View.VISIBLE

    val analysisPage = AnalysisPropertiesPage.newInstance(pointValue)
    this.childFragmentManager.beginTransaction()
      .replace(this.binding.fragmentContainer.id, analysisPage)
      .addToBackStack(null)
      .commit()
  }

  /**
   * Initializes all view references.
   */
  private fun initViews() {
    this.pointName = this.binding.PointIDName
    this.latitude = this.binding.latitudeValue
    this.longitude = this.binding.longitudeValue
    this.temperature = this.binding.temperatureValue
    this.chemistryAnalysisButton = this.binding.chemistryAnalysisButton

    this.chemistryAnalysisButton.setOnClickListener {
      thermalPoint?.let { it1 -> this.prepareFragment(it1) }
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
    }
  }

  /**
   * Updates basic information views.
   *
   * @param point Thermal point data source
   */
  private fun updateBasicInfo(point: ThermalPoint) {
    this.pointName.text = "Análisis: ${point.pointID}"

    // Corrigiendo orden coordenadas para el convertidor si lo requiere
    val wgs84Coordinates = CoordinateConverter.convertCRT05toWGS84(
      point.longitude, point.latitude
    )

    this.latitude.text = "%.7f".format(wgs84Coordinates.y)
    this.longitude.text = "%.7f".format(wgs84Coordinates.x)

    this.temperature.text = "%.2f °C".format(
      point.temperature
    )
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
