package com.inii.geoterra.development.ui.map.models

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import com.inii.geoterra.development.Geoterra
import com.inii.geoterra.development.api.geospatial.models.ThermalPoint
import com.inii.geoterra.development.interfaces.PageViewModel
import dagger.assisted.Assisted
import dagger.assisted.AssistedFactory
import dagger.assisted.AssistedInject

/**
 * @brief ViewModel for [ManifestationMenuViewModel]
 *
 * Holds a [thermal] and exposes it as immutable [LiveData].
 * Acts as a bridge between thermal point data and the UI.
 */
class ManifestationMenuViewModel @AssistedInject constructor(
  private val app : Geoterra,
  @Assisted private val _thermal: ThermalPoint
) : PageViewModel(app) {

  @AssistedFactory
  /** Interface for assisted injection factory */
  interface Factory {
    fun create(selectedThermal: ThermalPoint): ManifestationMenuViewModel
  }

  /** Internal mutable LiveData storing the selected thermal point */
  /** Public immutable LiveData for observers */
  val thermal: LiveData<ThermalPoint> get() = MutableLiveData(_thermal)

}