package com.inii.geoterra.development.device

import android.app.Activity
import android.content.Context
import androidx.core.app.ActivityCompat
import com.inii.geoterra.development.interfaces.PermissionRequester

class ActivityPermissionRequester(private val activity: Activity) :
  PermissionRequester {
  override fun requestPermission(permissions: Array<String>, requestCode: Int) {
    ActivityCompat.requestPermissions(activity, permissions, requestCode)
  }

  override fun shouldShowRationale(permission: String): Boolean {
    return ActivityCompat.shouldShowRequestPermissionRationale(activity, permission)
  }

  override fun getContext(): Context = activity
}
