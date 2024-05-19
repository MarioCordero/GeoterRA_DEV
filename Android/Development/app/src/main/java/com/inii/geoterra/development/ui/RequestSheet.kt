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

  private val imageView: ImageView
  private val textViewCoordenadas: TextView
  private val textViewFecha: TextView
  private val textViewEstado: TextView
  private val buttonContacto: Button
  private val buttonRepetirSolicitud: Button

  init {
    val inflater = LayoutInflater.from(context)
    val view = inflater.inflate(R.layout.request_sheet, this, true)

    // Obtener referencias a los elementos visuales
    imageView = view.findViewById(R.id.imageView5)
    textViewCoordenadas = view.findViewById(R.id.textView2)
    textViewFecha = view.findViewById(R.id.textView3)
    textViewEstado = view.findViewById(R.id.textView4)
    buttonContacto = view.findViewById(R.id.contact_us)
    buttonRepetirSolicitud = view.findViewById(R.id.repeat_request)
  }

  fun setInformation(coordenadas: String, fecha: String, estado: String) {
    imageView.clipToOutline
    textViewCoordenadas.text = "Coordenadas: $coordenadas"
    textViewFecha.text = "Fecha: $fecha"
    textViewEstado.text = "Estado: $estado"
  }

  fun setDimensiones(width: Int, height: Int) {
    // Establecer las nuevas dimensiones del contenedor principal
    val layoutParams = LayoutParams(width, height)
    setLayoutParams(layoutParams)
  }
}
