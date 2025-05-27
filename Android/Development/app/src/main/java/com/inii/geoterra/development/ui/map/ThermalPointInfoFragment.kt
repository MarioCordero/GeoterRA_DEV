package com.inii.geoterra.development.ui.map

import android.annotation.SuppressLint
import android.content.Context
import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.TextView
import androidx.fragment.app.Fragment
import com.inii.geoterra.development.R
import com.inii.geoterra.development.interfaces.FragmentListener
import com.inii.geoterra.development.api.ThermalPoint
import com.inii.geoterra.development.interfaces.PageFragment
import org.locationtech.proj4j.CRSFactory
import org.locationtech.proj4j.CoordinateTransformFactory
import org.locationtech.proj4j.ProjCoordinate
import org.osmdroid.util.GeoPoint

/**
 * A simple [Fragment] subclass.
 * Use the [ThermalPointInfoFragment.newInstance] factory method to
 * create an instance of this fragment.
 */
class ThermalPointInfoFragment : PageFragment() {
  private lateinit var rootView: View
  private var thermalPoint: ThermalPoint? = null

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    arguments?.let {
      @Suppress("DEPRECATION")
      thermalPoint = it.getSerializable(ARG_THERMAL_POINT) as? ThermalPoint
    }
  }

  override fun onCreateView(
    inflater : LayoutInflater,
    container : ViewGroup?,
    savedInstanceState : Bundle?
  ) : View {
    // Inflate the layout for this fragment
    this.rootView = inflater.inflate(
      R.layout.fragment_thermal_point_info,
      container,
      false
    )
    this.updateUI()
    val backButton = this.rootView.findViewById<Button>(R.id.go_back_button)
    backButton.setOnClickListener {
      Log.i(
        "button exit", "Latitud: ${this.thermalPoint!!.latitude}, " +
        "Longitud: ${this.thermalPoint!!.longitude}")
      this.listener?.onFragmentEvent(
        "FINISHED",
        GeoPoint(this.thermalPoint!!.latitude, this.thermalPoint!!.longitude)
      )
    }
    return this.rootView
  }

  @SuppressLint("SetTextI18n")
  private fun updateUI() {
    // Updates the UI with the thermal point information
    val thermalPointName = this.thermalPoint!!.pointID
    val thermalPointTextView = this.rootView.findViewById<TextView>(
      R.id.PointID_name
    )
    thermalPointTextView.text = "Punto Termal: $thermalPointName"

    val thermalPointLatitude = this.thermalPoint!!.latitude
    val thermalPointLongitude = this.thermalPoint!!.longitude
    val thermalPointCoordinatesTextView = this.rootView.findViewById<TextView>(
      R.id.coordenates
    )
    val wsg84Coordinates = convertCRT05toWGS84(
      thermalPointLatitude,
      thermalPointLongitude
    )
    thermalPointCoordinatesTextView.text =
      "Latitud: %.7f\nLongitud: %.7f"
        .format(wsg84Coordinates.x, wsg84Coordinates.y)

    val thermalPointTemperature = this.thermalPoint!!.temperature
    val thermalPointTemperatureTextView = this.rootView.findViewById<TextView>(
      R.id.point_temperature
    )
    thermalPointTemperatureTextView.text =
      "Temperatura: $thermalPointTemperature"

    val thermalPointFieldPh = this.thermalPoint!!.fieldPh
    val thermalPointFieldPhTextView = this.rootView.findViewById<TextView>(
      R.id.field_ph
    )
    thermalPointFieldPhTextView.text = "Campo pH: $thermalPointFieldPh"

    val thermalPointFieldCond = this.thermalPoint!!.fieldCond
    val thermalPointFieldCondTextView = this.rootView.findViewById<TextView>(
      R.id.field_conditions
    )
    thermalPointFieldCondTextView.text = "Campo Cond: $thermalPointFieldCond"

    val thermalPointLabPh = this.thermalPoint!!.labPh
    val thermalPointLabPhTextView = this.rootView.findViewById<TextView>(
      R.id.lab_ph
    )
    thermalPointLabPhTextView.text = "Lab pH: $thermalPointLabPh"

    val thermalPointLabCond = this.thermalPoint!!.labCond
    val thermalPointLabCondTextView = this.rootView.findViewById<TextView>(
      R.id.lab_conditions
    )
    thermalPointLabCondTextView.text = "Lab Cond: $thermalPointLabCond"

    val thermalPointChlorine = this.thermalPoint!!.chlorine
    val thermalPointChlorineTextView = this.rootView.findViewById<TextView>(
      R.id.chlorine
    )
    thermalPointChlorineTextView.text = "Cl: $thermalPointChlorine"

    val thermalPointCalcium = this.thermalPoint!!.calcium
    val thermalPointCalciumTextView = this.rootView.findViewById<TextView>(
      R.id.calcium
    )
    thermalPointCalciumTextView.text = "Ca+: $thermalPointCalcium"

    val thermalPointMgBicarbonate = this.thermalPoint!!.mgBicarbonate
    val thermalPointMgBicarbonateTextView =
      this.rootView.findViewById<TextView>(R.id.mg_bicarbonate)
    thermalPointMgBicarbonateTextView.text = "HCO3: $thermalPointMgBicarbonate"

    val thermalPointSulfate = this.thermalPoint!!.sulfate
    val thermalPointSulfateTextView = this.rootView.findViewById<TextView>(
      R.id.sulfate
    )
    thermalPointSulfateTextView.text = "SO4: $thermalPointSulfate"

    val thermalPointIron = this.thermalPoint!!.iron
    val thermalPointIronTextView = this.rootView.findViewById<TextView>(
      R.id.iron
    )
    thermalPointIronTextView.text = "Fe: $thermalPointIron"

    val thermalPointSilicon = this.thermalPoint!!.silicon
    val thermalPointSiliconTextView = this.rootView.findViewById<TextView>(
      R.id.silicon
    )
    thermalPointSiliconTextView.text = "Si: $thermalPointSilicon"

    val thermalPointBoron = this.thermalPoint!!.boron
    val thermalPointBoronTextView = this.rootView.findViewById<TextView>(
      R.id.boron
    )
    thermalPointBoronTextView.text = "B: $thermalPointBoron"

    val thermalPointLithium = this.thermalPoint!!.lithium
    val thermalPointLithiumTextView = this.rootView.findViewById<TextView>(
      R.id.lithium
    )
    thermalPointLithiumTextView.text = "Li: $thermalPointLithium"

    val thermalPointFluorine = this.thermalPoint!!.fluorine
    val thermalPointFluorineTextView = this.rootView.findViewById<TextView>(
      R.id.fluorine
    )
    thermalPointFluorineTextView.text = "F: $thermalPointFluorine"

    val thermalPointSodium = this.thermalPoint!!.sodium
    val thermalPointSodiumTextView = this.rootView.findViewById<TextView>(
      R.id.sodium
    )
    thermalPointSodiumTextView.text = "Na: $thermalPointSodium"

    val thermalPointPotassium = this.thermalPoint!!.potassium
    val thermalPointPotassiumTextView = this.rootView.findViewById<TextView>(
      R.id.potassium
    )
    thermalPointPotassiumTextView.text = "K: $thermalPointPotassium"

    val thermalPointMagnesiumIon = this.thermalPoint!!.magnesiumIon
    val thermalPointMagnesiumIonTextView = this.rootView.findViewById<TextView>(
      R.id.magnesium_Ion
    )
    thermalPointMagnesiumIonTextView.text = "Mg+: $thermalPointMagnesiumIon"
  }

  companion object {
    private const val ARG_THERMAL_POINT = "thermalPoint"
    /**
     * Use this factory method to create a new instance of
     * this fragment using the provided parameters.
     *
     * @return A new instance of fragment ThermalPointInfoFragment.
     */
    // TODO: Rename and change types and number of parameters
    @JvmStatic
    fun newInstance(thermalPoint: ThermalPoint) = ThermalPointInfoFragment()
      .apply {
      arguments = Bundle().apply {
        putSerializable(ARG_THERMAL_POINT, thermalPoint)
      }
    }
  }

  /**
   * Convert c r t05to w g s84
   *
   * @param x
   * @param y
   * @return
   */
  private fun convertCRT05toWGS84(x: Double, y: Double): ProjCoordinate {
    val crsFactory = CRSFactory()
    val transformFactory = CoordinateTransformFactory()

    // Define the coordinate systems
    val sourceCRS = crsFactory.createFromName("EPSG:5367")
    val targetCRS = crsFactory.createFromName("EPSG:4326")

    // Creates the transform
    val transform = transformFactory.createTransform(sourceCRS, targetCRS)

    // Defines the source and destination coordinates
    val srcCoord = ProjCoordinate(x, y)
    val dstCoord = ProjCoordinate()

    // Does the transformation
    transform.transform(srcCoord, dstCoord)

    return dstCoord
  }
}