package ucr.ac.cr.inii.geoterra.presentation.screens.map

import ucr.ac.cr.inii.geoterra.data.model.remote.ManifestationRemote

data class MapState(
  /* Inside your view-model */
  val styleUrl: String = "https://raw.githubusercontent.com/go2garret/maps/main/src/assets/json/arcgis_hybrid.json",
  val markers: List<ManifestationRemote> = emptyList(),
  val selectedManifestation: ManifestationRemote? = null,
  val isLoading: Boolean = false,
  val error: String? = null
)