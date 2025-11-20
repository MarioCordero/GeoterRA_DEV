package com.inii.geoterra.development.ui.elements

import android.content.Context
import android.util.AttributeSet
import android.view.LayoutInflater
import android.widget.LinearLayout
import com.google.android.material.textfield.TextInputEditText
import com.inii.geoterra.development.R

/**
 * @brief Custom form component for geological survey data entry
 *
 * Provides input fields for thermal sensation and terrain conditions observations.
 * Designed for field data collection during geothermal surveys.
 *
 * @property thermalSensationInput Field for subjective thermal assessment (1-5 scale)
 * @property conditionsInput Field for terrain condition descriptions
 */
class TerrainForm @JvmOverloads constructor(
  context: Context,
  attrs: AttributeSet? = null,
  defStyle: Int = 0
) : LinearLayout(context, attrs, defStyle) {
  // =============== VIEW COMPONENTS ===============
  /** @brief Input for thermal sensation rating (1-5 scale) */
  private val thermalSensationInput: TextInputEditText

  /** @brief Input for terrain/hydrological conditions description */
  private val conditionsInput: TextInputEditText

  // =============== INITIALIZATION ===============
  init {
    // Configure layout parameters
    this.orientation = VERTICAL

    // Inflate and attach custom layout
    LayoutInflater.from(context).inflate(
      R.layout.view_terrain_form,
      this,
      true
    ).apply {
      thermalSensationInput = findViewById(R.id.thermal_sensation_input)
      conditionsInput = findViewById(R.id.tv_conductivity)
    }
  }

  // =============== DATA ACCESS METHODS ===============
  /**
   * @brief Retrieves thermal sensation rating
   * @return String value from input field (1-5 scale)
   */
  fun getThermalSensation() : Int {
    if (thermalSensationInput.text.toString().isEmpty()) {
      return -2000
    }
    return thermalSensationInput.text.toString().toInt()
  }

  /**
   * @brief Retrieves terrain conditions description
   * @return Free-form text description of terrain conditions
   */
  fun getConditions(): String {
    return conditionsInput.text.toString()
  }
}