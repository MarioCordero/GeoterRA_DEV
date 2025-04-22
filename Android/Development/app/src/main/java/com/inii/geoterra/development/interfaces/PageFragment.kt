package com.inii.geoterra.development.interfaces

import android.os.Bundle
import android.view.View
import androidx.activity.OnBackPressedCallback
import androidx.fragment.app.Fragment

open class PageFragment : Fragment(), OnFragmentInteractionListener {
  open fun onHide() {
     // Deletes all fragments in the childFragmentManager
     childFragmentManager.fragments.forEach { fragment ->
       childFragmentManager.beginTransaction().remove(fragment).commit()
     }
  }
  open fun onShow() {

  }
}