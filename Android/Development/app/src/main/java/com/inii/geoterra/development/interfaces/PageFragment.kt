package com.inii.geoterra.development.interfaces

import android.content.Context
import android.util.Log
import androidx.fragment.app.Fragment
import com.inii.geoterra.development.api.APIService
import com.inii.geoterra.development.api.RetrofitClient

open class PageFragment : Fragment(), FragmentListener {
  protected val apiService: APIService = RetrofitClient.getAPIService()
  protected var listener: FragmentListener? = null

  final override fun onAttach(context: Context) {
    super.onAttach(context)

    val parent = parentFragment
    if (parent is FragmentListener) {
      this.listener = parent
      Log.i("PageFragment", "FragmentListener conectado con fragmento padre.")
    } else if (context is FragmentListener) {
      this.listener = context
      Log.i("PageFragment", "FragmentListener conectado con activity.")
    } else {
      Log.w("PageFragment", "Ni el contexto ni el fragmento padre implementan FragmentListener.")
    }
  }

  final override fun onDetach() {
    super.onDetach()
    this.listener = null
  }

  open fun onBackPressed(): Boolean {
    // Por defecto no consume el evento
    return false
  }

  open fun onHide() {
    // Deletes all fragments in the childFragmentManager
    childFragmentManager.fragments.forEach { childFragment ->
      childFragmentManager.beginTransaction().remove(childFragment).commit()
    }
  }

  open fun onShow() {
    // Hook para cuando se muestra este fragmento
  }
}
