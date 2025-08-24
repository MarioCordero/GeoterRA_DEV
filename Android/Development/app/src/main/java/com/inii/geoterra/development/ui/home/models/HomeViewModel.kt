package com.inii.geoterra.development.ui.home.models

import android.content.Context
import com.inii.geoterra.development.Geoterra
import com.inii.geoterra.development.interfaces.PageViewModel
import dagger.hilt.android.lifecycle.HiltViewModel
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject

@HiltViewModel
class HomeViewModel @Inject constructor(
  private val app : Geoterra,
) : PageViewModel(app) {

}