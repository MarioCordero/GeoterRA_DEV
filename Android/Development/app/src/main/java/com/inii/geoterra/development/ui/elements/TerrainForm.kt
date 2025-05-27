package com.inii.geoterra.development.ui.elements

import android.content.Context
import android.util.AttributeSet
import android.view.LayoutInflater
import android.widget.EditText
import android.widget.LinearLayout
import com.inii.geoterra.development.R

class TerrainForm @JvmOverloads constructor(
  context: Context,
  attrs: AttributeSet? = null,
  defStyle: Int = 0
) : LinearLayout(context, attrs, defStyle) {

  private val thermalSensationInput: EditText
  private val conditionsInput: EditText

  init {
    orientation = VERTICAL
    val binding = LayoutInflater.from(context).inflate(
      R.layout.terrain_form,
      this,
      true
    )

    this.thermalSensationInput = binding.findViewById(
      R.id.thermal_sensation_input
    )

    this.conditionsInput = binding.findViewById(R.id.conditions_input)
  }

  fun getThermalSensation(): String = thermalSensationInput.text.toString()

  fun getConditions(): String = conditionsInput.text.toString()

}