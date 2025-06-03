package com.inii.geoterra.development.ui.requests

import android.content.Context
import android.os.Bundle
import android.util.Log
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.Toast
import androidx.lifecycle.lifecycleScope
import com.inii.geoterra.development.R
import com.inii.geoterra.development.interfaces.FragmentListener
import com.inii.geoterra.development.api.APIService
import com.inii.geoterra.development.api.RequestDataCard
import com.inii.geoterra.development.api.RequestsSubmittedResponse
import com.inii.geoterra.development.api.RetrofitClient
import com.inii.geoterra.development.interfaces.PageFragment
import com.inii.geoterra.development.managers.SessionManager
import com.inii.geoterra.development.ui.elements.RequestSheet
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import retrofit2.Call
import retrofit2.Response

/**
 * A simple [Fragment] subclass.
 */
class RequestsFragment : PageFragment() {
  private var submittedRequest : List<RequestDataCard> = listOf()

  override fun onCreateView(
    inflater: LayoutInflater, container: ViewGroup?,
    savedInstanceState: Bundle?
  ) : View {
    // Inflate the layout for this fragment
    this.binding = inflater.inflate(
      R.layout.fragment_requests, container, false
    )

    SessionManager.setOnSessionActiveListener {
      this.getSubmittedRequests()
    }

    val requestButton = this.binding.findViewById<Button>(R.id.new_request_button)
    this.setRequestButtonClickListener(requestButton)
    return this.binding
  }

  override fun onFragmentEvent(event: String, data: Any?) {
    Log.i("FragmentEvent", "Event: $event")
    when (event) {
      "FINISHED" -> {
        Log.i("FragmentEvent", "FINISHED")
        this.binding.findViewById<FrameLayout>(
          R.id.form_container
        ).visibility = View.GONE
        this.childFragmentManager.popBackStack()
      }
    }
  }

  private fun setRequestButtonClickListener(requestButton : Button) {
    requestButton.setOnClickListener {
      if (SessionManager.isSessionActive()) {
        this.showForms()
      } else {
        Toast.makeText(
          requireContext(),
          "Por favor inicie sesión para poder realizar solicitudes de datos",
          Toast.LENGTH_SHORT
        ).show()
      }
    }
  }

  private fun getSubmittedRequests() {
    val call = this.apiService.getSubmittedRequests(
      SessionManager.getUserEmail().toString()
    )

    call.enqueue(object : retrofit2.Callback<RequestsSubmittedResponse> {
      override fun onResponse(call : Call<RequestsSubmittedResponse>,
        response : Response<RequestsSubmittedResponse>
      ) {
        if (response.isSuccessful) {
          // Handle the successful response
          submittedRequest = response.body()!!.requests
          lifecycleScope.launch(Dispatchers.Main) {
            updateUIWithRequests()
          }
        }
      }

      override fun onFailure(
        call : Call<RequestsSubmittedResponse>, t : Throwable) {
        Log.e(
          "RequestError",
          "Error al cargar los requests: ${t.message}"
        )
      }
    })
  }

  private fun updateUIWithRequests() {
    val sheetScrollView = this.binding.findViewById<LinearLayout>(
      R.id.sheetsLayout)
    sheetScrollView.removeAllViews()

    // Create a request sheet for each submitted request
    for ((index, request) in submittedRequest.withIndex()) {

      val requestSheet = RequestSheet(requireContext(), latitude = request
        .latitude, longitude = request.longitude, date = request.date, state
      = "aceptada")
      sheetScrollView.addView(requestSheet)

      if (index < submittedRequest.size - 1) {
        val spacer = View(requireContext())
        val layoutParams = LinearLayout.LayoutParams(
          LinearLayout.LayoutParams.MATCH_PARENT,
          40
        )
        spacer.layoutParams = layoutParams
        sheetScrollView.addView(spacer)
      }
    }
  }

  private fun showForms() {
    val formsFragment = FormFragment()
    this.binding.findViewById<FrameLayout>(
      R.id.form_container
    ).visibility = View.VISIBLE
    //Begin the transaction.
    this.childFragmentManager.beginTransaction()
      .replace(R.id.form_container, formsFragment)
      .addToBackStack(null)
      .commit()
  }

}