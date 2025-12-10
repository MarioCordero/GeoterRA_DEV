package com.inii.geoterra.development.ui.elements

import BubblingPresence
import ThermalSensation
import android.content.Context
import android.util.AttributeSet
import android.view.LayoutInflater
import android.widget.LinearLayout
import com.inii.geoterra.development.R
import com.inii.geoterra.development.databinding.ViewSpringFormBinding

/**
 * Custom view representing the form used to capture spring-related data.
 *
 * This view encapsulates UI logic and exposes typed getters for form values,
 * avoiding direct access to view components from external layers.
 */
class SpringForm @JvmOverloads constructor(
  context: Context,
  attrs: AttributeSet? = null,
  defStyle: Int = 0
) : LinearLayout(context, attrs, defStyle) {

  private val binding: ViewSpringFormBinding =
    ViewSpringFormBinding.inflate(
      LayoutInflater.from(context),
      this,
      true
    )

  init {
    orientation = VERTICAL
  }

  /**
   * Returns the selected thermal sensation.
   *
   * @return ThermalSensation if selected, or null if nothing is selected.
   */
  fun getThermalSensation(): ThermalSensation? {
    return when (binding.rgThermalSensation.checkedRadioButtonId) {
      R.id.rb_very_hot -> ThermalSensation.VERY_HOT
      R.id.rb_hot -> ThermalSensation.HOT
      R.id.rb_warm -> ThermalSensation.WARM
      R.id.rb_cold -> ThermalSensation.COLD
      else -> null
    }
  }

  /**
   * Returns the bubbling presence selection.
   *
   * @return BubblingPresence if selected, or null if nothing is selected.
   */
  fun getBubblingPresence(): BubblingPresence? {
    return when (binding.rgBubblPresence.checkedRadioButtonId) {
      R.id.rb_bubb_yes -> BubblingPresence.YES
      R.id.rb_bubb_no -> BubblingPresence.NO
      else -> null
    }
  }

  /**
   * Validates that all required fields in the form are selected.
   *
   * @return true if the form is valid, false otherwise.
   */
  fun isValid(): Boolean {
    return getThermalSensation() != null &&
      getBubblingPresence() != null
  }
}
