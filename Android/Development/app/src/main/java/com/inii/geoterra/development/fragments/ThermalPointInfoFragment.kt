package com.inii.geoterra.development.fragments

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.TextView
import androidx.fragment.app.Fragment
import com.inii.geoterra.development.R
import com.inii.geoterra.development.components.OnFragmentInteractionListener
import com.inii.geoterra.development.components.api.ThermalPoint

/**
 * A simple [Fragment] subclass.
 * Use the [ThermalPointInfoFragment.newInstance] factory method to
 * create an instance of this fragment.
 */
class ThermalPointInfoFragment : Fragment() {
  private lateinit var rootView: View
  private var listener : OnFragmentInteractionListener? = null
  private var thermalPoint: ThermalPoint? = null

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    arguments?.let {
      @Suppress("DEPRECATION")
      thermalPoint = it.getSerializable(ARG_THERMAL_POINT) as? ThermalPoint
    }
  }

  override fun onCreateView(inflater : LayoutInflater,
                            container : ViewGroup?,
                            savedInstanceState : Bundle?) : View? {
    // Inflate the layout for this fragment
    this.rootView = inflater.inflate(R.layout.fragment_thermal_point_info, container, false)
    this.listener = activity as? OnFragmentInteractionListener
    updateUI()
    val backButton = this.rootView.findViewById<Button>(R.id.go_back_button)
    backButton.setOnClickListener {
      goBack()
    }
    return this.rootView
  }

  private fun goBack() {
    val backButton = this.rootView.findViewById<Button>(R.id.go_back_button)
    backButton.visibility = View.INVISIBLE

    this.listener?.onFragmentFinished(this.thermalPoint!!.latitude, this.thermalPoint!!.longitude)
  }

  private fun updateUI() {
    // Updates the UI with the thermal point information
    val thermalPointName = this.thermalPoint!!.pointID
    val thermalPointTextView = this.rootView.findViewById<TextView>(R.id.PointID_name)
    thermalPointTextView.text = "Punto Termal: $thermalPointName"

    val thermalPointLatitude = this.thermalPoint!!.latitude
    val thermalPointLongitude = this.thermalPoint!!.longitude
    val thermalPointCoordinatesTextView = this.rootView.findViewById<TextView>(R.id.coordenates)
    thermalPointCoordinatesTextView.text =
      "Latitud: $thermalPointLatitude\nLongitud: $thermalPointLongitude"

    val thermalPointTemperature = this.thermalPoint!!.temperature
    val thermalPointTemperatureTextView =
      this.rootView.findViewById<TextView>(R.id.point_temperature)
    thermalPointTemperatureTextView.text = "Temperatura: $thermalPointTemperature"

    val thermalPointFieldPh = this.thermalPoint!!.fieldPh
    val thermalPointFieldPhTextView = this.rootView.findViewById<TextView>(R.id.field_ph)
    thermalPointFieldPhTextView.text = "Ph de Campo: $thermalPointFieldPh"

    val thermalPointFieldCond = this.thermalPoint!!.fieldCond
    val thermalPointFieldCondTextView = this.rootView.findViewById<TextView>(R.id.field_conditions)
    thermalPointFieldCondTextView.text = "Condiciones de Campo: $thermalPointFieldCond"

    val thermalPointLabPh = this.thermalPoint!!.labPh
    val thermalPointLabPhTextView = this.rootView.findViewById<TextView>(R.id.lab_ph)
    thermalPointLabPhTextView.text = "PH de Laboratorio: $thermalPointLabPh"

    val thermalPointLabCond = this.thermalPoint!!.labCond
    val thermalPointLabCondTextView = this.rootView.findViewById<TextView>(R.id.lab_conditions)
    thermalPointLabCondTextView.text = "Condiciones de Laboratorio: $thermalPointLabCond"

    val thermalPointChlorine = this.thermalPoint!!.chlorine
    val thermalPointChlorineTextView = this.rootView.findViewById<TextView>(R.id.chlorine)
    thermalPointChlorineTextView.text = "Chlorine: $thermalPointChlorine"

    val thermalPointCalcium = this.thermalPoint!!.calcium
    val thermalPointCalciumTextView = this.rootView.findViewById<TextView>(R.id.calcium)
    thermalPointCalciumTextView.text = "Calcium: $thermalPointCalcium"

    val thermalPointMgBicarbonate = this.thermalPoint!!.mgBicarbonate
    val thermalPointMgBicarbonateTextView =
      this.rootView.findViewById<TextView>(R.id.mg_bicarbonate)
    thermalPointMgBicarbonateTextView.text = "Mg Bicarbonate: $thermalPointMgBicarbonate"

    val thermalPointSulfate = this.thermalPoint!!.sulfate
    val thermalPointSulfateTextView = this.rootView.findViewById<TextView>(R.id.sulfate)
    thermalPointSulfateTextView.text = "Sulfate: $thermalPointSulfate"

    val thermalPointIron = this.thermalPoint!!.iron
    val thermalPointIronTextView = this.rootView.findViewById<TextView>(R.id.iron)
    thermalPointIronTextView.text = "Iron: $thermalPointIron"

    val thermalPointSilicon = this.thermalPoint!!.silicon
    val thermalPointSiliconTextView = this.rootView.findViewById<TextView>(R.id.silicon)
    thermalPointSiliconTextView.text = "Silicon: $thermalPointSilicon"

    val thermalPointBoron = this.thermalPoint!!.boron
    val thermalPointBoronTextView = this.rootView.findViewById<TextView>(R.id.boron)
    thermalPointBoronTextView.text = "Boron: $thermalPointBoron"

    val thermalPointLithium = this.thermalPoint!!.lithium
    val thermalPointLithiumTextView = this.rootView.findViewById<TextView>(R.id.lithium)
    thermalPointLithiumTextView.text = "Lithium: $thermalPointLithium"

    val thermalPointFluorine = this.thermalPoint!!.fluorine
    val thermalPointFluorineTextView = this.rootView.findViewById<TextView>(R.id.fluorine)
    thermalPointFluorineTextView.text = "Fluorine: $thermalPointFluorine"

    val thermalPointSodium = this.thermalPoint!!.sodium
    val thermalPointSodiumTextView = this.rootView.findViewById<TextView>(R.id.sodium)
    thermalPointSodiumTextView.text = "Sodium: $thermalPointSodium"

    val thermalPointPotassium = this.thermalPoint!!.potassium
    val thermalPointPotassiumTextView = this.rootView.findViewById<TextView>(R.id.potassium)
    thermalPointPotassiumTextView.text = "Potassium: $thermalPointPotassium"

    val thermalPointMagnesiumIon = this.thermalPoint!!.magnesiumIon
    val thermalPointMagnesiumIonTextView = this.rootView.findViewById<TextView>(R.id.magnesium_Ion)
    thermalPointMagnesiumIonTextView.text = "Magnesium Ion: $thermalPointMagnesiumIon"

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
    fun newInstance(thermalPoint: ThermalPoint) = ThermalPointInfoFragment().apply {
      arguments = Bundle().apply {
        putSerializable(ARG_THERMAL_POINT, thermalPoint)
      }
    }
  }
}