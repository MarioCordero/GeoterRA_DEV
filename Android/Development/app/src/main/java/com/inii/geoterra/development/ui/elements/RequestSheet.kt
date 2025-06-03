package com.inii.geoterra.development.ui.elements

import android.annotation.SuppressLint
import android.content.Context
import android.util.AttributeSet
import android.view.LayoutInflater
import android.view.View
import android.widget.ImageView
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
  /** @brief Container for fragment's view elements */
  private lateinit var binding: View

  // =============== VIEW COMPONENTS ===============
  /** @brief Visual representation of geographic location */
  private val locationImage : ImageView
  /** @brief Display for latitude/longitude values */
  private val coordinates: TextView
  /** @brief Request submission timestamp */
  private val dateView: TextView
  /** @brief Current request status */
  private val stateView: TextView

  init {
    // Inflate the layout for this custom view if it's not done by the parent XML
    this.binding = LayoutInflater.from(context).inflate(
      R.layout.request_sheet,
      this,
      true
    )

    // Initialize views after inflation
    this.locationImage = this.binding.findViewById(R.id.map_position_image)
    this.coordinates = this.binding.findViewById(R.id.coordenatesTxt) //
    this.dateView = findViewById(R.id.dateTxt)           // Assuming you
    this.stateView = findViewById(R.id.stateTxt)          // Assuming you
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
    locationImage.clipToOutline = true
    coordinates.text = "Latitude: %.7f\nLongitude: %.7f".format(
      latitude,
      longitude
    )
    this.dateView.text = "Date: $date"
    this.stateView.text = "Status: $state"
  }
}