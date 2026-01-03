package com.inii.geoterra.development.ui.elements

import android.annotation.SuppressLint
import android.content.Context
import android.util.Log
import android.widget.TextView
import com.inii.geoterra.development.R
import com.inii.geoterra.development.api.geospatial.models.ThermalPoint
import com.inii.geoterra.development.interfaces.MessageListener
import org.osmdroid.views.MapView
import org.osmdroid.views.overlay.Marker
import org.osmdroid.views.overlay.infowindow.InfoWindow

/**
 * @brief Custom map marker info window with thermal data display capabilities
 *
 * Displays either user position or thermal point information based on constructor used.
 * Implements click handling for additional data interaction.
 *
 * @property temperature Thermal measurement value (nullable for user position mode)
 * @property thermalPoint Associated thermal data point (nullable until set)
 * @property context Host context for activity communication
 * @property messageListener Callback interface for UI events
 */
class CustomInfoOnMarker : InfoWindow {
  // =============== VIEW STATE ===============
  /** @brief Thermal measurement value in Celsius (null for user position) */
  private var temperature: Double? = null

  /** @brief Complete thermal data point reference */
  private var thermalPoint: ThermalPoint? = null

  /** @brief Host activity context for resource access */
  private var context: Context? = null

  /** @brief Event listener for user interactions */
  private var messageListener: MessageListener? = null

  // =============== CONSTRUCTORS ===============
  /**
   * @brief Primary constructor for thermal point markers
   * @param layoutResId Layout resource for info window
   * @param mapView Parent map view reference
   * @param activity Host activity context
   * @param temperature Thermal measurement value
   * @param listener Event callback handler
   */
  constructor(
    layoutResId : Int,
    mapView : MapView,
    activity : Context,
    point : ThermalPoint? = null,
    temperature : Double,
    listener : MessageListener
  ) : super(layoutResId, mapView) {
    this.thermalPoint = point
    this.temperature = temperature
    this.context = activity
    this.messageListener = listener
  }

  /**
   * @brief Secondary constructor for user position marker
   * @param layoutResId Layout resource for info window
   * @param mapView Parent map view reference
   */
  constructor(layoutResId: Int, mapView: MapView) : super(layoutResId, mapView)

  // =============== LIFECYCLE METHODS ===============
  /**
   * @brief Configures info window content when opened
   * @param item Associated map marker reference
   *
   * Populates UI elements based on marker type (thermal point/user position).
   * Centers map view on marker location.
   */
  @SuppressLint("SetTextI18n")
  override fun onOpen(item: Any?) {
    val marker = item as Marker
    val position = marker.position

    // Coordinate display
    this.mView.findViewById<TextView>(
      R.id.tv_coordinates
    ).text = "%.7f°, %.7f°".format(
      position.latitude, position.longitude
    )

    // Thermal point specific UI
    this.temperature?.let { temp ->
      this.mView.apply {
        findViewById<TextView>(R.id.tv_temperature).text =
          "$temp °C"
        findViewById<TextView>(R.id.tv_region).text =
          "Guanacaste"
        findViewById<TextView>(R.id.tv_ph).text =
          thermalPoint?.labPh?.toString()
        findViewById<TextView>(R.id.tv_conductivity).text =
          thermalPoint?.labCond.toString() + " μS/cm"
        findViewById<TextView>(R.id.point_id).text =
          "Análisis ID: ${marker.title}"

        findViewById<TextView>(R.id.btn_more_info).setOnClickListener {
          handleMoreInfoClick(marker)
        }
      }

    } ?: run {
      // User position UI
      this.mView.findViewById<TextView>(R.id.user_position).text =
        "Tu ubicación actual"
    }

    this.mMapView.controller.setCenter(position)
  }

  /**
   * @brief Cleans up resources when window closes
   */
  override fun onClose() {
    super.close()
  }

  // =============== EVENT HANDLING ===============
  /**
   * @brief Initiates thermal point detail view
   * @param marker Source marker triggering the event
   */
  private fun handleMoreInfoClick(marker: Marker) {
    Log.i(
      "CustomInfoWindow",
          "Requesting details for ${marker.title}"
    )
    this.messageListener?.onMessageReceived(
      "SHOW_POINT",
      this.thermalPoint
    )
  }
}


