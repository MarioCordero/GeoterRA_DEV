package com.inii.geoterra.development.ui

import android.annotation.SuppressLint
import android.content.Context
import android.util.AttributeSet
import android.view.LayoutInflater
import android.widget.Button
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import com.inii.geoterra.development.R

class RequestSheet @JvmOverloads constructor(
  context: Context,
  attrs: AttributeSet? = null,
  defStyleAttr: Int = 0
) : LinearLayout(context, attrs, defStyleAttr) {

  private val locationImage : ImageView
  private val coordinates : TextView
  private val date : TextView
  private val state : TextView
  private val contactButton : Button
  private val repeatRequestButton : Button

  init {
    val inflater = LayoutInflater.from(context)
    val view = inflater.inflate(R.layout.request_sheet, this, true)

    // Obtain references to the views in the custom layout
    locationImage = view.findViewById(R.id.imageView5)
    coordinates = view.findViewById(R.id.coordenatesTxt)
    date = view.findViewById(R.id.dateTxt)
    state = view.findViewById(R.id.stateTxt)
    contactButton = view.findViewById(R.id.contact_us)
    repeatRequestButton = view.findViewById(R.id.repeat_request)
  }

  @SuppressLint("SetTextI18n")
  fun setInformation(latitude : Double, longitude : Double, date : String, state : String) {
    // Set the information in the custom layout views
    locationImage.clipToOutline
    this.coordinates.text = "Latitud: %.7f\nLongitud: %.7f".format(latitude, longitude)
    this.date.text = "Fecha: $date"
    this.state.text = "Estado: $state"
  }

  fun setDimensions(width: Int, height: Int) {
    // Set the dimensions of the custom layout
    val layoutParams = LayoutParams(width, height)
    setLayoutParams(layoutParams)
  }
}
