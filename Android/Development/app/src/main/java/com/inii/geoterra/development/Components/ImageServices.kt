package com.inii.geoterra.development.Components

import android.util.Log

class ImageServices {
  private var isGalleryAccessGranted : Boolean = false


  fun setGalleryAccess(userPermission : Boolean) {
    isGalleryAccessGranted = userPermission
    Log.i("isGalleryAccessGranted", "isGalleryAccessGranted: $userPermission")
  }
}