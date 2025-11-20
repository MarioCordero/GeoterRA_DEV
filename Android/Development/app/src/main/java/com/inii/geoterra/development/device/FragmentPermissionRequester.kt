package com.inii.geoterra.development.device

import android.content.Context
import androidx.fragment.app.Fragment
import com.inii.geoterra.development.interfaces.PermissionRequester

class FragmentPermissionRequester(private val fragment: Fragment) :
  PermissionRequester {
  override fun requestPermission(permissions: Array<String>, requestCode: Int) {
    fragment.requestPermissions(permissions, requestCode)
  }

  override fun shouldShowRationale(permission: String): Boolean {
    return fragment.shouldShowRequestPermissionRationale(permission)
  }

  override fun getContext(): Context = fragment.requireContext()
}
