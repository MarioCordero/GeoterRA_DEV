package com.inii.geoterra.development.ui.map.models

import android.content.Context
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import com.inii.geoterra.development.Geoterra
import com.inii.geoterra.development.api.ThermalPoint
import com.inii.geoterra.development.interfaces.PageViewModel
import dagger.assisted.Assisted
import dagger.assisted.AssistedFactory
import dagger.assisted.AssistedInject
import dagger.hilt.android.qualifiers.ApplicationContext

/**
 * @brief ViewModel for [AnalysisViewModel]
 *
 * Holds a [thermal] and exposes it as immutable [LiveData].
 * Acts as a bridge between thermal point data and the UI.
 */
class AnalysisViewModel @AssistedInject constructor(
  private val app : Geoterra,
  @Assisted private val _thermal: ThermalPoint
) : PageViewModel(app) {

  @AssistedFactory
  /** Interface for assisted injection factory */
  interface Factory {
    fun create(selectedThermal: ThermalPoint): AnalysisViewModel
  }

  /** Internal mutable LiveData storing the selected thermal point */
  /** Public immutable LiveData for observers */
  val thermal: LiveData<ThermalPoint> get() = MutableLiveData(_thermal)

}