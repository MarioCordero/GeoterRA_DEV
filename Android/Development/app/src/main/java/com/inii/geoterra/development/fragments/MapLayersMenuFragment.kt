package com.inii.geoterra.development.fragments

import android.content.DialogInterface
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import com.google.android.material.bottomsheet.BottomSheetDialogFragment
import com.inii.geoterra.development.R

class MapLayersMenuFragment : BottomSheetDialogFragment() {

  override fun onCreateView(
    inflater: LayoutInflater, container: ViewGroup?,
    savedInstanceState: Bundle?
  ): View? {
    // Inflar el layout del Bottom Sheet
    return inflater.inflate(R.layout.map_layers_menu, container, false)
  }

  override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
    super.onViewCreated(view, savedInstanceState)

    // Configurar las opciones del menú
    val option1 = view.findViewById<TextView>(R.id.filters)
    val option2 = view.findViewById<TextView>(R.id.layers)

    option1.setOnClickListener {
      // Acciones cuando se selecciona Opción 1
      dismiss() // Cerrar el Bottom Sheet
    }

    option2.setOnClickListener {
      // Acciones cuando se selecciona Opción 2
      dismiss()
    }

  }

  override fun onDismiss(dialog: DialogInterface) {
    super.onDismiss(dialog)
    // Puedes manejar el evento cuando el Bottom Sheet se cierra, si lo necesitas.
  }
}
