package com.inii.geoterra.development.ui

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

  private val locationImage: ImageView
  private val coordenates: TextView
  private val date: TextView
  private val state: TextView
  private val contactButton: Button
  private val repeatRequestButton: Button

  init {
    val inflater = LayoutInflater.from(context)
    val view = inflater.inflate(R.layout.request_sheet, this, true)

    // Obtener referencias a los elementos visuales
    locationImage = view.findViewById(R.id.imageView5)
    coordenates = view.findViewById(R.id.textView2)
    date = view.findViewById(R.id.textView3)
    state = view.findViewById(R.id.textView4)
    contactButton = view.findViewById(R.id.contact_us)
    repeatRequestButton = view.findViewById(R.id.repeat_request)
  }

  fun setInformation(coordenadas: String, fecha: String, estado: String) {
    locationImage.clipToOutline
    coordenates.text = "Coordenadas: $coordenadas"
    date.text = "Fecha: $fecha"
    state.text = "Estado: $estado"
  }

  fun setDimensiones(width: Int, height: Int) {
    // Respectable las nuevas dimensiones del contenedor principal
    val layoutParams = LayoutParams(width, height)
    setLayoutParams(layoutParams)
  }
}
