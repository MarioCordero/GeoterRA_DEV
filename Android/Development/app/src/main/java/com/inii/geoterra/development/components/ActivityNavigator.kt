package com.inii.geoterra.development.components

import android.content.Context
import android.content.Intent

/**
 * Object that provides navigation functionality between activities.
 */
object ActivityNavigator {

  /**
   * Changes the current activity to the specified destination activity.
   *
   * @param context The context from which the activity is being started.
   * @param destinationActivity The class of the activity to navigate to.
   */
  fun changeActivity(context: Context, destinationActivity: Class<*>) {
    val intent = Intent(context, destinationActivity)
    context.startActivity(intent)
  }
}
