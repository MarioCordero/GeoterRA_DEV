package ucr.ac.cr.inii.geoterra.presentation.screens.map

import ucr.ac.cr.inii.geoterra.data.model.local.UserLocation
import ucr.ac.cr.inii.geoterra.data.model.remote.ManifestationRemote

data class MapLayer(
  val id: String,
  val name: String,
  val url: String,
  val previewUrl: String? = null
)

data class MapState(
  val styleUrl: String = "https://raw.githubusercontent.com/go2garret/maps/main/src/assets/json/arcgis_hybrid.json",
  val markers: List<ManifestationRemote> = emptyList(),
  val userLocation: UserLocation? = null,
  val selectedManifestation: ManifestationRemote? = null,
  val isUserLocationSelected: Boolean = false,
  val isLoading: Boolean = false,
  val snackBarMessage: String? = null,

  val isFilterModalVisible: Boolean = false,
  val selectedRegionId: UInt? = null,
  val availableRegions: List<Pair<String, UInt>> = listOf(
    Pair("San José", 1u),
    Pair("Alajuela", 2u),
    Pair("Cartago", 3u),
    Pair("Heredia", 4u),
    Pair("Guanacaste", 5u),
    Pair("Puntarenas", 6u),
    Pair("Limón", 7u)
  ),
  val isLayerSelectionVisible: Boolean = false,
  val selectedLayerId: String = "hybrid",
  val availableLayers: List<MapLayer> = listOf(
    MapLayer("hybrid", "Híbrido", "https://raw.githubusercontent.com/go2garret/maps/main/src/assets/json/arcgis_hybrid.json"),
    MapLayer("streets", "Calles", "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"),
    MapLayer("dark", "Oscuro", "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"),
    MapLayer("light", "Claro", "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json")
  )
)