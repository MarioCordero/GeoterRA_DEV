package ucr.ac.cr.inii.geoterra.presentation.screens.map

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.key
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.em
import androidx.compose.ui.unit.sp
import geoterra.geoterraapp.generated.resources.Res
import geoterra.geoterraapp.generated.resources.ic_cluster
import geoterra.geoterraapp.generated.resources.ic_map_marker
import geoterra.geoterraapp.generated.resources.ic_marker
import geoterra.geoterraapp.generated.resources.ic_userMarker
import kotlinx.coroutines.launch
import org.jetbrains.compose.resources.painterResource
import org.maplibre.compose.camera.CameraPosition
import org.maplibre.compose.camera.rememberCameraState
import org.maplibre.compose.expressions.dsl.asString
import org.maplibre.compose.expressions.dsl.const
import org.maplibre.compose.expressions.dsl.feature
import org.maplibre.compose.expressions.dsl.image
import org.maplibre.compose.expressions.dsl.interpolate
import org.maplibre.compose.expressions.dsl.linear
import org.maplibre.compose.expressions.dsl.not
import org.maplibre.compose.expressions.dsl.offset
import org.maplibre.compose.expressions.dsl.plus
import org.maplibre.compose.expressions.dsl.zoom
import org.maplibre.compose.expressions.value.SymbolAnchor
import org.maplibre.compose.layers.RasterLayer
import org.maplibre.compose.layers.SymbolLayer
import org.maplibre.compose.map.MaplibreMap
import org.maplibre.compose.sources.GeoJsonData
import org.maplibre.compose.sources.GeoJsonOptions
import org.maplibre.compose.sources.rememberGeoJsonSource
import org.maplibre.compose.sources.rememberRasterSource
import org.maplibre.compose.style.BaseStyle
import org.maplibre.compose.util.ClickResult
import org.maplibre.spatialk.geojson.Feature
import org.maplibre.spatialk.geojson.Point
import org.maplibre.spatialk.geojson.Position
import ucr.ac.cr.inii.geoterra.data.model.responses.GeomanifestationResponse
import ucr.ac.cr.inii.geoterra.data.model.responses.toGeoJsonString
import ucr.ac.cr.inii.geoterra.presentation.components.map.ManifestationInfoPanel
import ucr.ac.cr.inii.geoterra.presentation.components.map.UserLocationInfoPanel

@Composable
fun MapContent(
	modifier: Modifier = Modifier,
	state: MapState,
	onManifestationMarkerClick: (String) -> Unit,
	onUserMarkerClick: () -> Unit,
	onDetailsClick: (GeomanifestationResponse) -> Unit,
	onDismissPanel: () -> Unit
) {
	Box(modifier = modifier.fillMaxSize()) {

		val coroutineScope = rememberCoroutineScope()
		val markerIcon = painterResource(Res.drawable.ic_map_marker)
		val userMarkerIcon = painterResource(Res.drawable.ic_userMarker)
		val clusterMarkerIcon = painterResource(Res.drawable.ic_cluster)

		val cameraState = rememberCameraState(
			firstPosition = CameraPosition(
				target = Position(latitude = 9.934739, longitude = -84.087502),
				zoom = 7.5
			)
		)

		LaunchedEffect(state.selectedManifestation) {
			state.selectedManifestation?.let { manifestation ->
				val targetZoom = cameraState.position.zoom.coerceAtLeast(14.0)
				cameraState.animateTo(
					CameraPosition(
						target = Position(
							latitude = manifestation.location.latitude
								?: state.userLocation?.latitude ?: 9.934739,
							longitude = manifestation.location.longitude
								?: state.userLocation?.longitude ?: -84.087502
						),
						zoom = targetZoom
					)
				)
			}
		}

		LaunchedEffect(
			state.isUserLocationSelected,
			state.userLocationTrigger,
			state.userLocation
		) {
			if (state.isUserLocationSelected) {
				state.userLocation?.let { userLoc ->
					val targetZoom = cameraState.position.zoom.coerceAtLeast(14.0)
					cameraState.animateTo(
						CameraPosition(
							target = Position(
								latitude = userLoc.latitude,
								longitude = userLoc.longitude
							),
							zoom = targetZoom
						)
					)
				}
			}
		}

		val onClusterClick: (List<Feature<*, *>>) -> ClickResult = { features ->
			val clickedFeature = features.firstOrNull()
			val pointGeometry = clickedFeature?.geometry as? Point
			if (pointGeometry != null) {
				val targetZoom = (cameraState.position.zoom + 2.5).coerceAtMost(18.0)
				coroutineScope.launch {
					cameraState.animateTo(
						CameraPosition(
							target = pointGeometry.coordinates,
							zoom = targetZoom
						)
					)
				}
			}
			ClickResult.Consume
		}

		MaplibreMap(
			modifier = Modifier.fillMaxSize(),
			baseStyle = BaseStyle.Uri(state.baseStyleUrl),
			cameraState = cameraState,
			onMapClick = { _, _ ->
				onDismissPanel()
				ClickResult.Pass
			},
			onMapLongClick = { pos, _ ->
				println("Long click at $pos")
				ClickResult.Pass
			}
		) {
			state.availableStyleLayers.filter { it.id in state.selectedLayerIds }.forEach { layer ->
				layer.snitRasterUrl?.let { rasterUrl ->
					val snitRasterSource = rememberRasterSource(
						tiles = listOf(rasterUrl),
						tileSize = 256
					)
					RasterLayer(
						id = "snit-raster-layer-${layer.id}",
						source = snitRasterSource
					)
				}
			}

			key(state.markers) {
				val manifestationSource = rememberGeoJsonSource(
					data = remember(state.markers) {
						GeoJsonData.JsonString(state.markers.toGeoJsonString())
					},
					options = GeoJsonOptions(
						cluster = true
					)
				)

				SymbolLayer(
					id = "cluster-icon-layer",
					source = manifestationSource,
					filter = feature.has("point_count"),
					iconImage = image(clusterMarkerIcon),
					iconSize = interpolate(
						linear(),
						zoom(),
						5f to const(1.0f),
						10f to const(1.2f),
						15f to const(1.5f)
					),
					iconAllowOverlap = const(true),
					iconIgnorePlacement = const(true),
					onClick = onClusterClick
				)

				SymbolLayer(
					id = "cluster-count-layer",
					source = manifestationSource,
					filter = feature.has("point_count"),
					textField = const("Geomanifestaciones (") + feature["point_count_abbreviated"].asString() + const(")"),
					textOffset = offset(0f.em, 2.5f.em),
					textSize = interpolate(
						linear(),
						zoom(),
						5f to const(12.sp),
						10f to const(14.sp),
						15f to const(16.sp)
					),
					textColor = const(Color.Black),
					textIgnorePlacement = const(true),
					textAllowOverlap = const(true),
					onClick = onClusterClick
				)

				SymbolLayer(
					id = "manifestations-layer",
					source = manifestationSource,
					filter = !feature.has("point_count"),
					iconImage = image(markerIcon),
					iconSize = interpolate(
						linear(),
						zoom(),
						5f to const(1.0f),
						10f to const(1.2f),
						15f to const(1.5f)
					),
					iconAllowOverlap = const(true),
					iconIgnorePlacement = const(true),
					iconAnchor = const(SymbolAnchor.Bottom),
					onClick = { features ->
						val rawId = features.firstOrNull()?.properties?.get("id")?.toString()
						val cleanId = rawId?.replace("\"", "")
						if (cleanId != null) {
							onManifestationMarkerClick(cleanId)
						}
						ClickResult.Consume
					}
				)
			}

			state.userLocation?.let { userLoc ->
				val userGeoJson = remember(userLoc.latitude, userLoc.longitude) {
					"""
					{
					  "type": "FeatureCollection",
					  "features": [
					    {
					      "type": "Feature",
					      "geometry": {
					        "type": "Point",
					        "coordinates": [${userLoc.longitude}, ${userLoc.latitude}]
					      },
					      "properties": { "type": "user" }
					    }
					  ]
					}
					""".trimIndent()
				}

				val userSource = rememberGeoJsonSource(
					data = GeoJsonData.JsonString(userGeoJson)
				)
//
//				5f to const(2.5f),
//				10f to const(4f),
//				18f to const(2f)

				SymbolLayer(
					id = "user-location-layer",
					source = userSource,
					iconImage = image(userMarkerIcon),
					iconSize = interpolate(
						linear(),
						zoom(),
						5f to const(1.0f),
						10f to const(1.2f),
						15f to const(1.5f)
					),
					iconAllowOverlap = const(false),
					iconIgnorePlacement = const(true),
					iconAnchor = const(SymbolAnchor.Bottom),
					onClick = {
						onUserMarkerClick()
						ClickResult.Consume
					}
				)
			}
		}

		state.selectedManifestation?.let { manifestation ->
			ManifestationInfoPanel(
				modifier = Modifier.align(Alignment.BottomCenter).navigationBarsPadding(),
				manifestation = manifestation,
				onViewFullDetails = { onDetailsClick(manifestation) }
			)
		}

		if (state.isUserLocationSelected && state.userLocation != null) {
			UserLocationInfoPanel(
				modifier = Modifier.align(Alignment.BottomCenter).navigationBarsPadding(),
				latitude = state.userLocation.latitude,
				longitude = state.userLocation.longitude
			)
		}

		if (state.isLoading) {
			CircularProgressIndicator(modifier = Modifier.align(Alignment.Center))
		}
	}
}