package com.inii.geoterra.development.ui.elements

import android.content.Context
import android.util.AttributeSet
import android.view.LayoutInflater
import android.widget.LinearLayout
import com.google.android.material.textfield.TextInputEditText
import com.inii.geoterra.development.R
import com.inii.geoterra.development.databinding.ViewTerrainFormBinding

/**
 * @brief Custom form component for geological survey data entry
 *
 * Provides input fields for thermal sensation and terrain conditions observations.
 * Designed for field data collection during geothermal surveys.
 */
class TerrainForm @JvmOverloads constructor(
  context: Context,
  attrs: AttributeSet? = null,
  defStyle: Int = 0
) : LinearLayout(context, attrs, defStyle) {
  // =============== VIEW COMPONENTS ===============

  private val binding : ViewTerrainFormBinding =
    ViewTerrainFormBinding.inflate(
    LayoutInflater.from(context), this, true
  )

  // =============== INITIALIZATION ===============
  init {
    // Configure layout parameters
    this.orientation = VERTICAL
  }

  // =============== DATA ACCESS METHODS ===============
  /**
   * @brief Retrieves thermal sensation rating
   * @return String value from input field (1-5 scale)
   */
  fun getThermalSensation() : Int {
    if (this.binding.etThermalSensation.text.toString().isEmpty()) {
      return -2000
    }
    return this.binding.etThermalSensation.text.toString().toInt()
  }

  /**
   * @brief Retrieves terrain conditions description
   * @return Free-form text description of terrain conditions
   */
  fun getConditions(): String {
    return this.binding.etConductivity.text.toString()
  }
}