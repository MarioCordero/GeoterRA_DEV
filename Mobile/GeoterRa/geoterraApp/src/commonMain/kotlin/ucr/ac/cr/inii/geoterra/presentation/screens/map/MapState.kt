package ucr.ac.cr.inii.geoterra.presentation.screens.map

import ucr.ac.cr.inii.geoterra.data.model.local.UserLocation
import ucr.ac.cr.inii.geoterra.data.model.remote.CantonRemote
import ucr.ac.cr.inii.geoterra.data.model.remote.DistrictRemote
import ucr.ac.cr.inii.geoterra.data.model.remote.ManifestationRemote
import ucr.ac.cr.inii.geoterra.data.model.remote.ProvinceRemote

/**
 * Represents a visual style layer configuration for the map view.
 */
data class MapLayer(
	val id: String,
	val name: String,
	val styleUrl: String,
	val snitRasterUrl: String? = null
)

/**
 * Holds the UI state for the map screen, including data markers, active filters, and layers.
 */
data class MapState(
	val baseStyleUrl: String = "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
	val selectedLayerIds: Set<String> = emptySet(),
	val markers: List<ManifestationRemote> = emptyList(),
	val userLocation: UserLocation? = null,
	val selectedManifestation: ManifestationRemote? = null,
	val isUserLocationSelected: Boolean = false,
	val userLocationTrigger: Long = 0L,
	val isLoading: Boolean = false,
	val snackBarMessage: String? = null,
	val isFilterModalVisible: Boolean = false,
	val availableProvinces: List<ProvinceRemote> = emptyList(),
	val availableCantons: List<CantonRemote> = emptyList(),
	val availableDistricts: List<DistrictRemote> = emptyList(),
	val selectedProvinceSnitCode: Int? = null,
	val selectedCantonSnitCode: Int? = null,
	val selectedDistrictSnitCode: Int? = null,
	val isLayerSelectionVisible: Boolean = false,
	val availableStyleLayers: List<MapLayer> = listOf(
		MapLayer(
			id = "snit_provincial",
			name = "Límite Provincial",
			styleUrl = baseStyleUrl,
			snitRasterUrl = "https://geos.snitcr.go.cr/be/IGN_5_CO/wms?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&FORMAT=image/png&TRANSPARENT=true&LAYERS=limiteprovincial_5k&STYLES=&CRS=EPSG:3857&WIDTH=256&HEIGHT=256&BBOX={bbox-epsg-3857}"
		),
		MapLayer(
			id = "snit_cantonal",
			name = "Límite Cantonal",
			styleUrl = baseStyleUrl,
			snitRasterUrl = "https://geos.snitcr.go.cr/be/IGN_5_CO/wms?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&FORMAT=image/png&TRANSPARENT=true&LAYERS=limitecantonal_5k&STYLES=&CRS=EPSG:3857&WIDTH=256&HEIGHT=256&BBOX={bbox-epsg-3857}"
		),
		MapLayer(
			id = "snit_distrital",
			name = "Límite Distrital",
			styleUrl = baseStyleUrl,
			snitRasterUrl = "https://geos.snitcr.go.cr/be/IGN_5_CO/wms?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&FORMAT=image/png&TRANSPARENT=true&LAYERS=limitedistrital_5k&STYLES=&CRS=EPSG:3857&WIDTH=256&HEIGHT=256&BBOX={bbox-epsg-3857}"
		)
	)
)