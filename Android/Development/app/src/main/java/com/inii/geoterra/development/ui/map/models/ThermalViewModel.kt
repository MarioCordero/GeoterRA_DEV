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
import dagger.hilt.android.lifecycle.HiltViewModel
import dagger.hilt.android.qualifiers.ApplicationContext
import org.osmdroid.util.GeoPoint

class ThermalViewModel @AssistedInject constructor(
  private val app : Geoterra,
  @Assisted private val _thermal: ThermalPoint
) : PageViewModel(app) {

  @AssistedFactory
  /** Interface for assisted injection factory */
  interface Factory {
    fun create(selectedThermal: ThermalPoint): ThermalViewModel
  }

  /** LiveData holding the thermal point assigned to this ViewModel */
  /** Public LiveData that the UI can observe */
  val thermal: LiveData<ThermalPoint> get() = MutableLiveData(_thermal)

  /**
   * Retrieves the location in GeoPoint format.
   *
   * @return GeoPoint containing latitude and longitude
   */
  fun getGeoPoint(): GeoPoint? {
    return this.thermal.value?.let { GeoPoint(it.latitude, it.longitude) }
  }
}
