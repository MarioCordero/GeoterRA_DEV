package com.inii.geoterra.development.ui.elements

import android.annotation.SuppressLint
import android.content.Context
import android.util.Log
import android.widget.TextView
import com.inii.geoterra.development.R
import com.inii.geoterra.development.interfaces.MessageListener
import com.inii.geoterra.development.api.ThermalPoint
import org.osmdroid.views.MapView
import org.osmdroid.views.overlay.Marker
import org.osmdroid.views.overlay.infowindow.InfoWindow

class CustomInfoOnMarker : InfoWindow {
  // Defines a nullable property `temperature` of type `Double` in case is the user's info window
  private var temperature: Double? = null
  private var thermalPoint : ThermalPoint? = null
  private var context : Context? = null
  private var messageListener: MessageListener? = null

  // Primary constructor that receives `layoutResId`
  // `mapView`, and `temperature`.
  // Used for the point's info window.
  constructor(
    layoutResId: Int,
    mapView: MapView,
    activity: Context,
    temperature: Double) :
    super(layoutResId,
    mapView,
  ) {
    this.temperature = temperature
    this.context = activity
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
    val textView = this.mView.findViewById<TextView>(R.id.coordinates)
    textView.text = "Latitud: %.7f\nLongitud: %.7f".format(latitude, longitude)

    val temperatureTextView = this.mView.findViewById<TextView>(
      R.id.temperature
    )

    if (this.temperature != null) {
      temperatureTextView.text = "Temperatura: %.2f".format(this.temperature)
    }
    Log.d("CustomInfoWindow", "onOpen: $temperature")
    // Center the map on the marker's location when the info window is opened
    this.mMapView.controller.setCenter(marker.position)

    if (this.temperature != null) {
      val pointId = mView.findViewById<TextView>(R.id.point_id)
      pointId.text = "Point ID: ${marker.title}"

      val moreInfoText = this.mView.findViewById<TextView>(R.id.more_info)
      moreInfoText.setOnClickListener {
        Log.i("CustomInfoWindow", "More info button clicked")
        sendMessageToActivity(marker)
      }
    } else {
      val userPosition = mView.findViewById<TextView>(R.id.user_position)
      userPosition.text = "Tu ubicación actual"
    }
  }

  fun setMessageListener(listener: MessageListener) {
    this.messageListener = listener
  }

  private fun sendMessageToActivity(marker : Marker) {
    Log.i(
      "CustomInfoWindow",
      "Sending message to activity, ${marker.title}"
    )
    this.messageListener?.onMessageReceived(marker.title)
  }

  override fun onClose() {
    super.close()
  }

}


