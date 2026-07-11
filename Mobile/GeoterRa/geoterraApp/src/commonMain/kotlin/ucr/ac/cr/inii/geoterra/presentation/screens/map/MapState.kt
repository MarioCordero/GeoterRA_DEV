package ucr.ac.cr.inii.geoterra.presentation.screens.map

import ucr.ac.cr.inii.geoterra.data.model.responses.CantonResponse
import ucr.ac.cr.inii.geoterra.data.model.responses.DistrictResponse
import ucr.ac.cr.inii.geoterra.data.model.responses.GeomanifestationResponse
import ucr.ac.cr.inii.geoterra.data.model.responses.PaginationResponse
import ucr.ac.cr.inii.geoterra.data.model.responses.ProvinceResponse
import ucr.ac.cr.inii.geoterra.domain.location.UserLocation

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
	val markers: List<GeomanifestationResponse> = emptyList(),
	val pagination: PaginationResponse? = null,
	val selectedTempMin: Double? = null,
	val selectedTempMax: Double? = null,
	val userLocation: UserLocation? = null,
	val selectedManifestation: GeomanifestationResponse? = null,
	val isUserLocationSelected: Boolean = false,
	val userLocationTrigger: Long = 0L,
	val isLoading: Boolean = false,
	val snackBarMessage: String? = null,
	val isFilterModalVisible: Boolean = false,
	val availableProvinces: List<ProvinceResponse> = emptyList(),
	val availableCantons: List<CantonResponse> = emptyList(),
	val availableDistricts: List<DistrictResponse> = emptyList(),
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