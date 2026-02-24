package ucr.ac.cr.inii.geoterra.presentation.screens.map

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import geoterra.composeapp.generated.resources.Res
import geoterra.composeapp.generated.resources.ic_marker
import geoterra.composeapp.generated.resources.ic_userMarker
import org.jetbrains.compose.resources.painterResource
import org.maplibre.compose.camera.CameraPosition
import org.maplibre.compose.camera.rememberCameraState
import org.maplibre.compose.expressions.dsl.const
import org.maplibre.compose.expressions.dsl.image
import org.maplibre.compose.expressions.dsl.interpolate
import org.maplibre.compose.expressions.dsl.linear
import org.maplibre.compose.expressions.dsl.zoom
import org.maplibre.compose.expressions.value.SymbolAnchor
import org.maplibre.compose.layers.SymbolLayer
import org.maplibre.compose.map.MaplibreMap
import org.maplibre.compose.sources.GeoJsonData
import org.maplibre.compose.sources.rememberGeoJsonSource
import org.maplibre.compose.style.BaseStyle
import org.maplibre.compose.util.ClickResult
import org.maplibre.spatialk.geojson.Position
import ucr.ac.cr.inii.geoterra.data.model.remote.ManifestationRemote
import ucr.ac.cr.inii.geoterra.data.model.remote.toGeoJsonString
import ucr.ac.cr.inii.geoterra.presentation.components.map.ManifestationInfoPanel


@Composable
fun MapContent(
  state: MapState,
  onMarkerClick: (String) -> Unit,
  onDetailsClick: (ManifestationRemote) -> Unit,
  onDismissPanel: () -> Unit
) {
  Box(modifier = Modifier.fillMaxSize()) {
    
    val markerIcon = painterResource(Res.drawable.ic_marker)
    
    val cameraState = rememberCameraState(
      firstPosition = (
        CameraPosition(
          target = Position (latitude = 9.934739, longitude = -84.087502),
          zoom = 7.5)
        )
    )
    
    LaunchedEffect(state.selectedManifestation) {
      state.selectedManifestation?.let { manifestation ->
        cameraState.animateTo(
          CameraPosition(
            target = Position(
              latitude = manifestation.latitude.toDouble(),
              longitude = manifestation.longitude.toDouble()
            ),
            zoom = 12.0
          )
        )
      }
    }
    
    MaplibreMap(
      modifier = Modifier.fillMaxSize(),
      baseStyle = BaseStyle.Uri(state.styleUrl),
      cameraState = cameraState,
      onMapClick = { pos, offset ->
        onDismissPanel()
        ClickResult.Pass
      },
      onMapLongClick = { pos, offset ->
        println("Long click at $pos")
        ClickResult.Pass
      }
    
    ) {
      
      val manifestationSource = rememberGeoJsonSource(
        data = remember(state.markers) {
          val jsonString = state.markers.toGeoJsonString()
          GeoJsonData.JsonString(jsonString)
        }
      )
      
      SymbolLayer(
        id = "manifestations-layer",
        source = manifestationSource,
        iconImage = image(markerIcon),
        iconSize = interpolate(
          linear(),
          zoom(),
          5f to const(2.5f),
          10f to const(4f),
          18f to const(2f)
        ),
        iconAllowOverlap = const(true),
        iconIgnorePlacement = const(true),
        iconAnchor = const(SymbolAnchor.Bottom),
        onClick = { features ->
          val rawId = features.firstOrNull()?.properties?.get("id")?.toString()
          val cleanId = rawId?.replace("\"", "")
          
          println("DEBUG: Click detectado en ID: $cleanId")
          if (cleanId != null) {
            onMarkerClick(cleanId)
          }
          ClickResult.Consume
        }
      )
      
      val userMarkerIcon = painterResource(Res.drawable.ic_userMarker)
      
      state.userLocation?.let { userLoc ->
        val userGeoJson = """
        {
          "type": "FeatureCollection",
          "features": [
            {
              "type": "Feature",
              "geometry": {
                "type": "Point",
                "coordinates": [${userLoc.longitude}, ${userLoc.latitude}]
              },
              "properties": {
                "type": "user",
                "name": "Mi ubicación"
              }
            }
          ]
        }
    """.trimIndent()
        
        val userSource = rememberGeoJsonSource(
          data = remember(userLoc) {
            GeoJsonData.JsonString(userGeoJson)
          }
        )
        
        SymbolLayer(
          id = "user-location-layer",
          source = userSource,
          iconImage = image(userMarkerIcon),
          iconSize = interpolate(
            linear(),
            zoom(),
            5f to const(2.5f),
            10f to const(4f),
            18f to const(2f)
          ),
          iconAllowOverlap = const(false),
          iconIgnorePlacement = const(true)
        )
      }
    }
    
    state.selectedManifestation?.let { manifestation ->
      ManifestationInfoPanel(
        modifier = Modifier
          .align(Alignment.BottomCenter)
          .navigationBarsPadding(),
        manifestation = manifestation,
        onViewFullDetails = { onDetailsClick(manifestation) }
      )
    }
    
    if (state.isLoading) {
      CircularProgressIndicator(modifier = Modifier.align(Alignment.Center))
    }
    
    state.error?.let { error ->
      Text(
        text = error,
        modifier = Modifier.align(Alignment.BottomCenter)
      )
    }
  }
}