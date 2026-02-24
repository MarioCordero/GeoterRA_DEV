package ucr.ac.cr.inii.geoterra.presentation.screens.manifestation

import ucr.ac.cr.inii.geoterra.data.model.remote.ManifestationRemote

data class ManifestationDetailState(
  val manifestation: ManifestationRemote? = null,
  val isLoading: Boolean = false,
  val isExporting: Boolean = false,
  val error: String? = null
)