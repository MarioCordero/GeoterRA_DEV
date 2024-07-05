package com.inii.geoterra.development.Components

import android.content.Context
import android.content.Intent

object ActivityNavigator {
  fun changeActivity(context : Context, destinationActivity : Class<*>, currentActivity : Class<*>) {
    val intent = Intent(context, destinationActivity)
    context.startActivity(intent)
  }

}