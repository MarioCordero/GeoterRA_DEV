package com.inii.geoterra.development.ui.requests.views

import android.graphics.BitmapFactory
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.LinearLayout
import android.widget.Toast
import androidx.fragment.app.viewModels
import com.inii.geoterra.development.databinding.FragmentRequestsBinding
import com.inii.geoterra.development.interfaces.PageView
import com.inii.geoterra.development.managers.SessionManager
import com.inii.geoterra.development.ui.elements.RequestSheet
import com.inii.geoterra.development.ui.requests.models.RequestsViewModel
import dagger.hilt.android.AndroidEntryPoint
import com.inii.geoterra.development.R
import com.inii.geoterra.development.api.requests.models.AnalysisRequest
import timber.log.Timber

@AndroidEntryPoint
class RequestsView : PageView<FragmentRequestsBinding, RequestsViewModel>(
  FragmentRequestsBinding::inflate,
  RequestsViewModel::class.java
) {

  override val viewModel : RequestsViewModel by viewModels()

  // Mapa para mantener referencia de los RequestSheet creados
  private val requestSheets = mutableMapOf<String, RequestSheet>()

  override fun onCreatePageView(inflater : LayoutInflater,
                                container : ViewGroup?
  ) : View {
    return this.binding.root
  }

  override fun onCreatePage(savedInstanceState : Bundle?) {
    // Inicialización si es necesaria
  }

  override fun onShow() {
    super.onShow()
    this.drawSubmittedRequests()
  }

  override fun observeViewModel() {
    this.viewModel.errorMessage.observe(viewLifecycleOwner) { error ->
      this.showToast(error, Toast.LENGTH_SHORT)
    }

    this.viewModel.submittedRequests.observe(viewLifecycleOwner) {
      this.drawSubmittedRequests()
    }

    this.viewModel.sessionActive.observe(viewLifecycleOwner) { isActive ->
      if (isActive) {
        viewModel.reloadIfSessionActive()
      } else {
        binding.layoutSubmittedRequests.removeAllViews()
        requestSheets.clear()
      }
    }
  }

  override fun setUpListeners() {
    this.binding.btnCreateRequest.setOnClickListener {
      if (SessionManager.isSessionActive()) {
        this.showRequestForm(null) // null indica creación nueva
      } else {
        this.showLoginPrompt()
      }
    }
  }

  private fun showLoginPrompt() {
    this.showToast(
      "Por favor inicie sesión para crear una solicitud de análisis",
      Toast.LENGTH_SHORT
    )
  }

  /**
   * Displays the request submission form.
   *
   * @param request AnalysisRequest a editar, o null para creación nueva
   */
  private fun showRequestForm(request: AnalysisRequest?) {
    // Create new form fragment instance
    val requestToUse = request ?: AnalysisRequest()
    val formsFragment = RequestFormView.newInstance(requestToUse)

    // Make form container visible
    this.binding.containerForm.visibility = View.VISIBLE

    // Perform fragment transaction
    this.childFragmentManager.beginTransaction()
      .replace(this.binding.containerForm.id, formsFragment)
      .addToBackStack(null)  // Allow back navigation
      .commit()
  }

  /**
   * @brief Handles the events triggered by child fragments.
   */
  override fun onPageEvent(event: String, data: Any?) {
    Timber.tag("PageEvent").i("Event: $event, Data: $data")
    when (event) {
      "FORM_FINISHED" -> {
        this.binding.containerForm.visibility = View.GONE
        this.childFragmentManager.popBackStack()
        this.viewModel.fetchSubmittedRequests()
      }
    }
  }

  override fun onParentEvent(event: String, data: Any?) {
    Timber.tag("PageEvent").i("Event: $event, Data: $data")
    when (event) {
      "USER_LOGGED_OUT" -> {
        this.viewModel.fetchSubmittedRequests()
        this.drawSubmittedRequests()
      }
    }
  }

  private fun drawSubmittedRequests() {
    val requests = viewModel.submittedRequests.value ?: emptyList()

    binding.layoutSubmittedRequests.removeAllViews()
    requestSheets.clear()

    requests.forEachIndexed { _, request ->
      // Select image based on request type
      val photo = when (request.type.name) {
        "Manantial" -> BitmapFactory.decodeResource(
          resources,
          R.drawable.hotspring_image
        )
        "Fumarola" -> BitmapFactory.decodeResource(
          resources,
          R.drawable.fumaroles_image
        )
        else -> BitmapFactory.decodeResource(
          resources,
          R.drawable.hotspring_image
        )
      }

      // Create UI component using domain model
      val sheet = RequestSheet(
        context = requireContext(),
        request = request,
        photoBitmap = photo
      )

      // Configurar listener para las acciones
      sheet.onActionListener = { action, _ : AnalysisRequest ->
        handleRequestAction(action, request)
      }

      // Guardar referencia por ID
      requestSheets[request.id] = sheet

      binding.layoutSubmittedRequests.addView(sheet)

//      if (index < requests.lastIndex) {
//        addRequestSpacer()
//      }
    }
  }

  /**
   * @brief Handles actions from RequestSheet components
   *
   * @param action The action to perform: VIEW, EDIT, or DELETE
   * @param request The AnalysisRequest associated with the action
   */
  private fun handleRequestAction(action: String, request: AnalysisRequest) {
    Timber.tag("RequestAction").i("Action: $action on request: ${request.id}")

    when (action) {
      "VIEW" -> {
        // Mostrar detalles completos de la solicitud
        showToast("Viendo solicitud: ${request.id}", Toast.LENGTH_SHORT)
        // Aquí puedes abrir un fragmento de detalles
        showRequestDetails(request)
      }

      "EDIT" -> {
        // Abrir formulario en modo edición
        showToast("Editando solicitud: ${request.id}", Toast.LENGTH_SHORT)
        showRequestForm(request)
      }

      "DELETE" -> {
        // Confirmar y eliminar
        showDeleteConfirmation(request)
      }
    }
  }

  /**
   * @brief Shows details of a specific request
   */
  private fun showRequestDetails(request: AnalysisRequest) {
    // Aquí puedes implementar un fragmento o diálogo para mostrar detalles completos
    // Por ahora solo mostramos un toast
    val message = """
      Solicitud: ${request.id}
      Tipo: ${request.type}
      Región: ${request.region}
      Fecha: ${request.date}
      Estado: Pendiente
    """.trimIndent()

    // Para un diálogo más elaborado:
    // DetailsDialogFragment.newInstance(request).show(childFragmentManager, "details")

    showToast(message, Toast.LENGTH_LONG)
  }

  /**
   * @brief Shows confirmation dialog before deleting a request
   */
  private fun showDeleteConfirmation(request: AnalysisRequest) {
    // Puedes usar un AlertDialog o implementar un diálogo personalizado
    androidx.appcompat.app.AlertDialog.Builder(requireContext())
      .setTitle("Confirmar eliminación")
      .setMessage("¿Está seguro de que desea eliminar la solicitud ${request.id}?")
      .setPositiveButton("Eliminar") { dialog, _ ->
        performDeleteRequest(request)
        dialog.dismiss()
      }
      .setNegativeButton("Cancelar") { dialog, _ ->
        dialog.dismiss()
      }
      .show()
  }

  /**
   * @brief Performs the actual deletion of a request
   */
  private fun performDeleteRequest(request: AnalysisRequest) {
//    // Aquí llamarías al ViewModel para eliminar
//    viewModel.deleteRequest(request.id)

    // Opcional: Mostrar retroalimentación visual en la tarjeta
    requestSheets[request.id]?.apply {
      // Puedes cambiar el color o mostrar un estado de "eliminando"
      alpha = 0.5f
      isEnabled = false
    }

    showToast("Solicitud ${request.id} eliminada", Toast.LENGTH_SHORT)
  }

  /**
   * Adds visual spacer between request sheets.
   */
  private fun addRequestSpacer() {
    val spacer = View(requireContext())
    val layoutParams = LinearLayout.LayoutParams(
      LinearLayout.LayoutParams.MATCH_PARENT,
      40 // 40dp height
    )
    spacer.layoutParams = layoutParams
    this.binding.layoutSubmittedRequests.addView(spacer)
  }
}