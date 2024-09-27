package com.inii.geoterra.development.ui

import android.annotation.SuppressLint
import android.util.Log
import android.view.View
import android.widget.TextView
import com.inii.geoterra.development.R
import org.osmdroid.views.MapView
import org.osmdroid.views.overlay.Marker
import org.osmdroid.views.overlay.infowindow.InfoWindow

class CustomInfoOnMarker : InfoWindow {
  // Defines a nullable property `temperature` of type `Double` in case is the user's info window
  private var temperature: Double? = null

  // Primary constructor that receives `layoutResId`, `mapView`, and `temperature`.
  // Used for the point's info window.
  constructor(layoutResId : Int, mapView : MapView, temperature : Double) : super(
    layoutResId,
    mapView
  ) {
    this.temperature = temperature
  }
  // Secondary constructor that receives `layoutResId` and `mapView`.
  // Used for the user's info window.
  constructor(layoutResId: Int, mapView: MapView) : super(layoutResId, mapView)

  /**
   * Called when the info window is opened.
   *
   * @param item The marker associated with the info window.
   */
  @SuppressLint("SetTextI18n")
  override fun onOpen(item : Any?) {
    // Get the marker associated with the info window
    val marker = item as Marker

    // Get the coordinates of the marker
    val latitude = marker.position.latitude
    val longitude = marker.position.longitude

    // Display the coordinates in the info window
    val textView = mView.findViewById<TextView>(R.id.coordinates)
    textView.text = "Latitud: %.7f\nLongitud: %.7f".format(latitude, longitude)

    val temperatureTextView = mView.findViewById<TextView>(R.id.temperature)

    if (temperature != null) {
      temperatureTextView.text = "Temperature: %.2f".format(temperature)
    }
    Log.d("CustomInfoWindow", "onOpen: $temperature")
    // Center the map on the marker's location when the info window is opened
    mMapView.controller.setCenter(marker.position)

    // Find and use other views in the info window layout if needed
    val contentView = mView.findViewById<View>(R.id.info_window_marker_text)
    if (temperature != null) {
      val pointId = mView.findViewById<TextView>(R.id.point_id)
      pointId.text = "Point ID: ${marker.title}"
    } else {
      val userPosition = mView.findViewById<TextView>(R.id.user_position)
      userPosition.text = "Tu ubicación actual"
    }
  }

  /**
   * Called when the info window is closed.
   */
  override fun onClose() {
    super.close()
  }
}
