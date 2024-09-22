package com.inii.geoterra.development.ui

import android.annotation.SuppressLint
import android.view.View
import android.widget.TextView
import com.inii.geoterra.development.R
import org.osmdroid.views.MapView
import org.osmdroid.views.overlay.Marker
import org.osmdroid.views.overlay.infowindow.InfoWindow

/**
 * Custom info window for displaying information on a map marker.
 *
 * @param layoutResId The resource ID of the layout for the info window.
 * @param mapView The MapView where the marker and info window are displayed.
 */
class CustomInfoOnMarker(layoutResId: Int, mapView: MapView, private var temperature : Double) : InfoWindow(layoutResId, mapView) {
  /**
   * Called when the info window is opened.
   *
   * @param item The marker associated with the info window.
   */
  @SuppressLint("SetTextI18n")
  override fun onOpen(item: Any?) {
    // Get the marker associated with the info window
    val marker = item as Marker

    // Get the coordinates of the marker
    val latitude = marker.position.latitude
    val longitude = marker.position.longitude

    // Display the coordinates in the info window
    val textView = mView.findViewById<TextView>(R.id.coordinates)
    textView.text = "Latitud: %.7f\nLongitud: %.7f".format(latitude, longitude)

    val temperatureTextView = mView.findViewById<TextView>(R.id.temperature)
    temperatureTextView.text = "Temperature: %.2f".format(temperature)

    // Center the map on the marker's location when the info window is opened
    mMapView.controller.setCenter(marker.position)

    // Find and use other views in the info window layout if needed
    val contentView = mView.findViewById<View>(R.id.info_window_marker_text)
    val pointId = mView.findViewById<TextView>(R.id.point_id)
    pointId.text = "Point ID: ${marker.title}"
  }

  /**
   * Called when the info window is closed.
   */
  override fun onClose() {
    super.close()
  }
}
