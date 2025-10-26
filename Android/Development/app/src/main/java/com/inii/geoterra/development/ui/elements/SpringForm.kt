package com.inii.geoterra.development.ui.elements

import android.content.Context
import android.util.AttributeSet
import android.view.LayoutInflater
import android.widget.LinearLayout
import com.google.android.material.textfield.TextInputEditText
import com.inii.geoterra.development.R
import com.inii.geoterra.development.databinding.ViewSpringFormBinding

/**
 * A custom LinearLayout view representing a form for capturing spring-related information.
 * This form includes input fields for thermal sensation and bubbles.
 *
 * The layout for this form is defined in `R.layout.view_spring_form`.
 *
 * @param context The context the view is running in, through which it can
 *                access the current theme, resources, etc.
 * @param attrs The attributes of the XML tag that is inflating the view.
 * @param defStyle An attribute in the current theme that contains a
 *                 reference to a style resource that supplies default values for
 *                 the view. Can be 0 to not look for defaults.
 */
class SpringForm @JvmOverloads constructor(
  context: Context,
  attrs: AttributeSet? = null,
  defStyle: Int = 0
) : LinearLayout(context, attrs, defStyle) {

  private val binding : ViewSpringFormBinding = ViewSpringFormBinding.inflate(
    LayoutInflater.from(context), this, true
  )

  init {
    orientation = VERTICAL
  }

  fun getThermalSensation() : Int {
    if (this.binding.etThermalSensation.text.toString().isEmpty()) {
      return -2000
    }
    return this.binding.etThermalSensation.text.toString().toInt()
  }

  fun getBubbling(): Int {
    if (this.binding.etBubbles.text.toString().isEmpty()) {
      return 0
    }
    return this.binding.etBubbles.text.toString().toInt()
  }
}