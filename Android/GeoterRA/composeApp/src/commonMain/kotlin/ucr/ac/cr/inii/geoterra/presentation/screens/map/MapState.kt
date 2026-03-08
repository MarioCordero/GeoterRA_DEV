package ucr.ac.cr.inii.geoterra.presentation.screens.map

import ucr.ac.cr.inii.geoterra.data.model.local.UserLocation
import ucr.ac.cr.inii.geoterra.data.model.remote.ManifestationRemote

data class MapLayer(
  val id: String,
  val name: String,
  val styleUrl: String,
  val snitRasterUrl: String? = null
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
    MapLayer("light", "Claro", "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"),
    // Capas SNIT (Servicio IGN_5)
    MapLayer(
      id = "snit_cultivos",
      name = "Cultivos 2017",
      styleUrl = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
      snitRasterUrl = "https://geos.snitcr.go.cr/be/IGN_5/ows?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&FORMAT=image/png&TRANSPARENT=true&LAYERS=cultivos2017_5k&STYLES=&CRS=EPSG:3857&WIDTH=256&HEIGHT=256&BBOX={bbox-epsg-3857}"
    ),
    MapLayer(
      id = "snit_curvas",
      name = "Curvas de Nivel",
      styleUrl = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
      snitRasterUrl = "https://geos.snitcr.go.cr/be/IGN_5/ows?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&FORMAT=image/png&TRANSPARENT=true&LAYERS=curvas_5000&STYLES=&CRS=EPSG:3857&WIDTH=256&HEIGHT=256&BBOX={bbox-epsg-3857}"
    ),
    MapLayer(
      id = "snit_edificaciones",
      name = "Edificaciones 2017",
      styleUrl = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
      snitRasterUrl = "https://geos.snitcr.go.cr/be/IGN_5/ows?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&FORMAT=image/png&TRANSPARENT=true&LAYERS=edificaciones2017_5k&STYLES=&CRS=EPSG:3857&WIDTH=256&HEIGHT=256&BBOX={bbox-epsg-3857}"
    ),
    MapLayer(
      id = "snit_forestal",
      name = "Cobertura Forestal",
      styleUrl = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
      snitRasterUrl = "https://geos.snitcr.go.cr/be/IGN_5/ows?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&FORMAT=image/png&TRANSPARENT=true&LAYERS=forestal2017_5k&STYLES=&CRS=EPSG:3857&WIDTH=256&HEIGHT=256&BBOX={bbox-epsg-3857}"
    ),
    MapLayer(
      id = "snit_hidrografia",
      name = "Hidrografía",
      styleUrl = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
      snitRasterUrl = "https://geos.snitcr.go.cr/be/IGN_5/ows?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&FORMAT=image/png&TRANSPARENT=true&LAYERS=hidrografia_5000&STYLES=&CRS=EPSG:3857&WIDTH=256&HEIGHT=256&BBOX={bbox-epsg-3857}"
    ),
    MapLayer(
      id = "snit_pastos",
      name = "Pastos 2017",
      styleUrl = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
      snitRasterUrl = "https://geos.snitcr.go.cr/be/IGN_5/ows?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&FORMAT=image/png&TRANSPARENT=true&LAYERS=pastos2017_5k&STYLES=&CRS=EPSG:3857&WIDTH=256&HEIGHT=256&BBOX={bbox-epsg-3857}"
    ),
    MapLayer(
      id = "snit_urbano",
      name = "Urbano 1:5k",
      styleUrl = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
      snitRasterUrl = "https://geos.snitcr.go.cr/be/IGN_5/ows?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&FORMAT=image/png&TRANSPARENT=true&LAYERS=urbano_5000&STYLES=&CRS=EPSG:3857&WIDTH=256&HEIGHT=256&BBOX={bbox-epsg-3857}"
    ),
    MapLayer(
      id = "snit_vias",
      name = "Vías 1:5k",
      styleUrl = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
      snitRasterUrl = "https://geos.snitcr.go.cr/be/IGN_5/ows?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&FORMAT=image/png&TRANSPARENT=true&LAYERS=vias_5000&STYLES=&CRS=EPSG:3857&WIDTH=256&HEIGHT=256&BBOX={bbox-epsg-3857}"
    )
  )
)