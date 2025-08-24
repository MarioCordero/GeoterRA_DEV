package com.inii.geoterra.development.ui.map

import android.content.DialogInterface
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import com.google.android.material.bottomsheet.BottomSheetDialogFragment
import com.inii.geoterra.development.R

/**
 * Bottom sheet fragment for displaying map layer options.
 *
 * Provides a menu interface for users to select different map layers
 * or filtering options. Dismisses automatically when an option is selected.
 */
class MapLayersMenuFragment : BottomSheetDialogFragment() {

  /**
   * Inflates the bottom sheet layout.
   *
   * @param inflater LayoutInflater to inflate views
   * @param container Parent view group for the fragment
   * @param savedInstanceState Previously saved fragment state
   * @return Inflated view hierarchy for the bottom sheet
   */
  override fun onCreateView(
    inflater: LayoutInflater, container: ViewGroup?,
    savedInstanceState: Bundle?
  ): View? {
    // Inflate the bottom sheet layout
    return inflater.inflate(R.layout.view_filters_menu, container, false)
  }

  /**
   * Configures menu options after view creation.
   *
   * @param view Root view of the inflated layout
   * @param savedInstanceState Previously saved fragment state
   */
  override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
    super.onViewCreated(view, savedInstanceState)

    // Initialize menu option views
    val filtersOption = view.findViewById<TextView>(R.id.filters)
    val layersOption = view.findViewById<TextView>(R.id.layers)

    // Set click listener for Filters option
    filtersOption.setOnClickListener {
      // Handle filters selection logic here
      dismiss() // Close the bottom sheet
    }

    // Set click listener for Layers option
    layersOption.setOnClickListener {
      // Handle layers selection logic here
      dismiss() // Close the bottom sheet
    }

  }

  /**
   * Handles bottom sheet dismissal.
   *
   * @param dialog The dialog interface being dismissed
   */
  override fun onDismiss(dialog: DialogInterface) {
    super.onDismiss(dialog)
  }
}
