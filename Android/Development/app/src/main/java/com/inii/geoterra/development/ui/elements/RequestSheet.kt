package com.inii.geoterra.development.ui.elements

import android.annotation.SuppressLint
import android.content.Context
import android.util.AttributeSet
import android.view.LayoutInflater
import android.view.View
import android.widget.LinearLayout
import android.widget.TextView
import com.inii.geoterra.development.R

/**
 * @brief Custom bottom sheet component for displaying service request details
 *
 * Shows geographic coordinates, request date, status, and provides action buttons.
 * Manages following UI components:
 * @property locationImage Preview of geographic location
 * @property coordinates Display for latitude/longitude values
 * @property date Request submission timestamp
 * @property state Current request status
 * // Removed contactButton and repeatRequestButton as they are not initialized
 */
class RequestSheet @JvmOverloads constructor(
  context: Context,
  attrs: AttributeSet? = null,
  defStyleAttr: Int = 0,
  latitude: Double,
  longitude: Double,
  date: String,
  state: String
) : LinearLayout(context, attrs, defStyleAttr) {
  // =============== VIEW BINDING ===============
  // Inflate the layout for this custom view
  /** @brief Container for fragment's view elements */
  private var binding: View = LayoutInflater.from(context).inflate(
    R.layout.view_request_sheet,
    this,
    true
  )
  // =============== VIEW COMPONENTS ===============
  // Initialize views after inflation
  /** @brief Display for latitude/longitude values */
  private val coordinates: TextView =
    this.binding.findViewById(R.id.coordenatesTxt)

  /** @brief Request submission timestamp */
  private val dateView: TextView = findViewById(R.id.dateTxt)

  /** @brief Current request status */
  private val stateView: TextView = findViewById(R.id.stateTxt)

  init {
    setupView(latitude, longitude, date, state)
  }

  // =============== Setter ===============
  /**
   * @brief Updates display with request information
   * @param latitude Geographic coordinate value
   * @param longitude Geographic coordinate value
   * @param date Request submission timestamp (formatted string)
   * @param state Current processing status description
   *
   * Formats coordinates to 7 decimal places (~1cm precision) and updates
   * all text displays. Triggers UI refresh.
   */
  @SuppressLint("SetTextI18n")
  fun setupView(latitude: Double, longitude: Double, date: String,
    state: String) {
    coordinates.text = "Latitud: %.7f\nLongitud: %.7f".format(
      latitude,
      longitude
    )
    this.dateView.text = "Fecha: $date"
    this.stateView.text = "Estado: $state"
  }
}