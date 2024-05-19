package com.inii.geoterra.development.Components

import android.annotation.SuppressLint
import android.view.View
import android.widget.TextView
import com.inii.geoterra.development.R
import org.osmdroid.views.MapView
import org.osmdroid.views.overlay.Marker
import org.osmdroid.views.overlay.infowindow.InfoWindow

class CustomInfoOnMarker (layoutResId: Int, mapView: MapView) :
  InfoWindow(layoutResId, mapView) {
  @SuppressLint("SetTextI18n")
  override fun onOpen(item : Any?) {
    // Obtener el marcador asociado a la ventana de información
    val marker = item as Marker

    // Obtener las coordenadas del marcador
    val latitude = marker.position.latitude
    val longitude = marker.position.longitude

    // Mostrar las coordenadas en la ventana de información
    val textView = mView.findViewById<TextView>(R.id.info_window_text)
    textView.text = "Latitud: $latitude\nLongitud: $longitude"

    // Centrar el mapa en la ubicación del marcador cuando se abre la ventana de información
    mMapView.controller.setCenter(marker.position)

    val contentView = mView.findViewById<View>(R.id.info_window_marker_text)
  }

  override fun onClose() {
    super.close()
  }
}