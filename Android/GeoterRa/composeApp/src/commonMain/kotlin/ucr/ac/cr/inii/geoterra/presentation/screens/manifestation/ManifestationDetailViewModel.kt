package ucr.ac.cr.inii.geoterra.presentation.screens.manifestation

import cafe.adriel.voyager.core.model.screenModelScope
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import ucr.ac.cr.inii.geoterra.data.model.remote.ManifestationRemote
import ucr.ac.cr.inii.geoterra.presentation.base.BaseScreenModel

class ManifestationDetailViewModel(
  private val initialManifestation: ManifestationRemote
) : BaseScreenModel<ManifestationDetailState>(ManifestationDetailState(manifestation = initialManifestation)) {
  
  fun downloadReport() {
    screenModelScope.launch {
      _state.update { it.copy(isExporting = true) }
      // Lógica de generación de PDF/CSV aquí
      _state.update { it.copy(isExporting = false) }
    }
  }
}