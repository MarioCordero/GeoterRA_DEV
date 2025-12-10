package com.inii.geoterra.development.ui.elements

import android.annotation.SuppressLint
import android.content.Context
import android.graphics.Bitmap
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
  photoBitmap: Bitmap,
  name: String,
  type : String,
  region: String,
  latitude: Double,
  longitude: Double,
  date: String,
  state: String
) : LinearLayout(context, attrs, defStyleAttr) {

  private val binding: View = LayoutInflater.from(context).inflate(
    R.layout.view_request_sheet,
    this,
    true
  )

  private val typeImage: ImageView =
    binding.findViewById(R.id.typeImage)

  private val et_name: TextView =
    binding.findViewById(R.id.tv_name)

  private val et_type: TextView =
    binding.findViewById(R.id.tv_type)

  private val et_region: TextView =
    binding.findViewById(R.id.tv_region)

  private val et_latitude: TextView =
    binding.findViewById(R.id.tv_latitude)

  private val et_longitude: TextView =
    binding.findViewById(R.id.tv_longitude)

  private val dateView: TextView =
    binding.findViewById(R.id.tv_date)

  private val stateView: TextView =
    binding.findViewById(R.id.tv_state)

  init {
    setupView(photoBitmap, name, type, region, latitude, longitude, date, state)
  }

  @SuppressLint("SetTextI18n")
  private fun setupView(
    photoBitmap: Bitmap,
    name: String,
    type: String,
    region: String,
    latitude: Double,
    longitude: Double,
    date: String,
    state: String) {

    // Set ONLY the PNG/JPG drawable image
    typeImage.setImageBitmap(photoBitmap)

    et_name.text = name
    et_region.text = region

    et_type.text = type

    et_latitude.text = "%.7f".format(
      latitude
    )

    et_longitude.text = "%.7f".format(
      longitude
    )

    dateView.text = date
    stateView.text = state
  }
}