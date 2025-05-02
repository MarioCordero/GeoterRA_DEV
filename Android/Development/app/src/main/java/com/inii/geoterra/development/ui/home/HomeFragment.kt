package com.inii.geoterra.development.ui.home

import android.content.Context
import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import com.inii.geoterra.development.R
import com.inii.geoterra.development.interfaces.FragmentListener
import com.inii.geoterra.development.api.APIService
import com.inii.geoterra.development.api.RetrofitClient

/**
 * A simple [Fragment] subclass.
 * Use the [HomeFragment.newInstance] factory method to
 * create an instance of this fragment.
 */
class HomeFragment : Fragment() {
  private var API_INSTANCE : APIService = RetrofitClient.getAPIService()
  private var listener : FragmentListener? = null
  private lateinit var binding : View

  override fun onCreateView(
    inflater: LayoutInflater, container: ViewGroup?,
    savedInstanceState: Bundle?
  ): View {
    // Inflate the layout for this fragment
    this.binding = inflater.inflate(
      R.layout.fragment_home, container, false
    )

    return this.binding
  }

  override fun onAttach(context: Context) {
    super.onAttach(context)
    if (context is FragmentListener) {
      this.listener = context
    }
  }

  override fun onDetach() {
    super.onDetach()
    this.listener = null
  }
}
