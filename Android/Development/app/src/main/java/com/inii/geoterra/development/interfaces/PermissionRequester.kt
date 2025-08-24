package com.inii.geoterra.development.interfaces

import android.content.Context

interface PermissionRequester {
  fun requestPermission(permissions: Array<String>, requestCode: Int)
  fun shouldShowRationale(permission: String): Boolean
  fun getContext(): Context
}
