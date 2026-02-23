package ucr.ac.cr.inii.geoterra.presentation.screens.map

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.em
import geoterra.composeapp.generated.resources.Res
import geoterra.composeapp.generated.resources.ic_marker
import org.jetbrains.compose.resources.painterResource
import org.maplibre.compose.camera.CameraPosition
import org.maplibre.compose.camera.rememberCameraState
import org.maplibre.compose.expressions.dsl.asString
import org.maplibre.compose.expressions.dsl.const
import org.maplibre.compose.expressions.dsl.feature
import org.maplibre.compose.expressions.dsl.format
import org.maplibre.compose.expressions.dsl.image
import org.maplibre.compose.expressions.dsl.offset
import org.maplibre.compose.expressions.dsl.span
import org.maplibre.compose.expressions.value.SymbolAnchor
import org.maplibre.compose.layers.SymbolLayer
import org.maplibre.compose.map.MaplibreMap
import org.maplibre.compose.sources.GeoJsonData
import org.maplibre.compose.sources.rememberGeoJsonSource
import org.maplibre.compose.style.BaseStyle
import org.maplibre.compose.util.ClickResult
import org.maplibre.spatialk.geojson.Feature
import org.maplibre.spatialk.geojson.FeatureCollection
import org.maplibre.spatialk.geojson.Point
import org.maplibre.spatialk.geojson.Position
import org.maplibre.spatialk.geojson.toJson
import ucr.ac.cr.inii.geoterra.data.model.remote.ManifestationRemote
import ucr.ac.cr.inii.geoterra.data.model.remote.toGeoJsonString


@Composable
fun MapContent(
  state: MapState,
  onMarkerClick: (String) -> Unit
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
    
    MaplibreMap(
      modifier = Modifier.fillMaxSize(),
      baseStyle = BaseStyle.Uri(state.styleUrl),
      cameraState = cameraState,
      onMapClick = { pos, offset ->
        val features = cameraState.projection?.queryRenderedFeatures(
          offset,
          setOf("manifestations-layer")
        )
        
        if (!features.isNullOrEmpty()) {
          println("Click en Marcador: ${features[0].properties?.get("name")}")
          ClickResult.Consume
        } else {
          ClickResult.Pass
        }
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
        textField =
          format(
            span(image("railway")),
            span(" "),
            span(feature["STNCODE"].asString(), textSize = const(1.2f.em)),
          ),
        textFont = const(listOf("Noto Sans Regular")),
        textColor = const(MaterialTheme.colorScheme.onBackground),
        textOffset = offset(0.em, 0.6.em),
        onClick = { features ->
          val name = features.firstOrNull()?.properties?.get("name")
          println("Click en: $name")
          ClickResult.Consume
        }
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