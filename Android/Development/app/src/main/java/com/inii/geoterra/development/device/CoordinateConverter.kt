package com.inii.geoterra.development.device

import android.util.Log
import org.locationtech.proj4j.CRSFactory
import org.locationtech.proj4j.CoordinateTransformFactory
import org.locationtech.proj4j.ProjCoordinate
import org.osmdroid.util.GeoPoint

/**
 * Utility class for coordinate system conversions.
 */
object CoordinateConverter {

  /**
   * Converts CRT05 coordinates to WGS84 standard.
   *
   * @param x CRT05 longitude value
   * @param y CRT05 latitude value
   * @return ProjCoordinate in WGS84 coordinate system
   */
  fun convertCRT05toWGS84(x: Double, y: Double): ProjCoordinate {
    if (x in -180.0..180.0 && y in -90.0..90.0) {
      Log.i("CRSCheck", "Coordenadas ya están en WGS84: lat=$y, lon=$x")
      return ProjCoordinate(y, x)
    }

    val crsFactory = CRSFactory()
    val transformFactory = CoordinateTransformFactory()

    val sourceCRS = crsFactory.createFromName("EPSG:5367")
    val targetCRS = crsFactory.createFromName("EPSG:4326")

    val transform = transformFactory.createTransform(sourceCRS, targetCRS)

    val srcCoord = ProjCoordinate(x, y)
    val dstCoord = ProjCoordinate()

    transform.transform(srcCoord, dstCoord)
    return ProjCoordinate(dstCoord.y, dstCoord.x)
  }
}