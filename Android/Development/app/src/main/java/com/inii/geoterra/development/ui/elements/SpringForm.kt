package com.inii.geoterra.development.ui.elements

import android.content.Context
import android.util.AttributeSet
import android.view.LayoutInflater
import android.widget.EditText
import android.widget.LinearLayout
import com.google.android.material.textfield.TextInputEditText
import com.inii.geoterra.development.R

/**
 * A custom LinearLayout view representing a form for capturing spring-related information.
 * This form includes input fields for thermal sensation and bubbles.
 *
 * The layout for this form is defined in `R.layout.spring_form`.
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

  private val thermalSensationInput: TextInputEditText
  private val bubblesInput: TextInputEditText

  init {
    orientation = VERTICAL
    val binding = LayoutInflater.from(context).inflate(
      R.layout.spring_form,
      this,
      true
    )

    this.thermalSensationInput = binding.findViewById(
      R.id.thermal_sensation_input
    )
    this.bubblesInput = binding.findViewById(R.id.bubbling_input)
  }

  fun getThermalSensation(): String = thermalSensationInput.text.toString()

  fun getBubbling(): String = bubblesInput.text.toString()

}