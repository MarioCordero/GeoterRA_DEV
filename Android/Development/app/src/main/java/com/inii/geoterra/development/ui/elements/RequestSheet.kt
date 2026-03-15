package com.inii.geoterra.development.ui.elements

import android.annotation.SuppressLint
import android.content.Context
import android.graphics.Bitmap
import android.util.AttributeSet
import android.view.LayoutInflater
import android.view.View
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import com.inii.geoterra.development.R
import com.inii.geoterra.development.api.requests.models.AnalysisRequest

/**
 * @brief Custom UI component that renders an AnalysisRequest in a visual sheet.
 *
 * This view is responsible ONLY for displaying data.
 * All business logic must be handled externally (ViewModel).
 */
class RequestSheet @JvmOverloads constructor(
  context: Context,
  attrs: AttributeSet? = null,
  defStyleAttr: Int = 0,
  private val request: AnalysisRequest,
  private val photoBitmap: Bitmap
) : LinearLayout(context, attrs, defStyleAttr) {

  /** Inflated root view */
  private val binding: View = LayoutInflater.from(context).inflate(
    R.layout.view_request_sheet,
    this,
    true
  )

  private val typeImage: ImageView =
    binding.findViewById(R.id.typeImage)

  private val tvName: TextView =
    binding.findViewById(R.id.tv_name)

  private val tvType: TextView =
    binding.findViewById(R.id.tv_type)

  private val tvRegion: TextView =
    binding.findViewById(R.id.tv_region)

  private val tvLatitude: TextView =
    binding.findViewById(R.id.tv_latitude)

  private val tvLongitude: TextView =
    binding.findViewById(R.id.tv_longitude)

  private val tvDate: TextView =
    binding.findViewById(R.id.tv_date)

  private val tvState: TextView =
    binding.findViewById(R.id.tv_state)

  // Agrega botones para las acciones
  private val btnView: TextView = binding.findViewById(R.id.btn_show)
  private val btnEdit: TextView = binding.findViewById(R.id.btn_edit)
  private val btnDelete: TextView = binding.findViewById(R.id.btn_delete)

  // Listener para manejar acciones
  var onActionListener: ((String, AnalysisRequest) -> Unit)? = null

  init {
    bindRequest(request)
    setupClickListeners()
  }

  /**
   * @brief Binds an AnalysisRequest to the UI components.
   *
   * @param request Domain model containing all request information
   */
  @SuppressLint("SetTextI18n")
  private fun bindRequest(request: AnalysisRequest) {
    // Set image representing the request type
    typeImage.setImageBitmap(photoBitmap)

    // Display request identifier
    tvName.text = "SOLI-${request.id}"

    // Display request attributes
    tvType.text = request.type.name
    tvRegion.text = request.region

    // Format coordinates with fixed precision
    tvLatitude.text = "%.4f".format(request.latitude)
    tvLongitude.text = "%.4f".format(request.longitude)

    // Date and state
    tvDate.text = request.date
    // TODO: REMOVE AND ADD THE STATE FIELD.
    tvState.text = "Pendiente"
  }

  /**
   * @brief Sets up click listeners for action buttons
   */
  private fun setupClickListeners() {
    // Acción: Ver detalles
    btnView.setOnClickListener {
      onActionListener?.invoke("VIEW", request)
    }

    // Acción: Editar
    btnEdit.setOnClickListener {
      onActionListener?.invoke("EDIT", request)
    }

    // Acción: Eliminar
    btnDelete.setOnClickListener {
      onActionListener?.invoke("DELETE", request)
    }
  }
}