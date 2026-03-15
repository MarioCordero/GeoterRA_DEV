package com.inii.geoterra.development.api.geospatial.models

import android.os.Parcelable
import com.google.gson.annotations.SerializedName
import com.inii.geoterra.development.api.common.models.ApiError
import kotlinx.parcelize.Parcelize

/**
 * Represents a geographical coordinate point
 * @property latitude WGS84 decimal coordinate (-90 to 90)
 * @property longitude WGS84 decimal coordinate (-180 to 180)
 */
@Parcelize
data class GeoCoordinate(
    @SerializedName("latitude") val latitude: Double = 0.0,
    @SerializedName("longitude") val longitude: Double = 0.0
) : Parcelable

/**
 * Complete thermal manifestation point with water analysis data
 * @property id Unique geological identifier
 * @property coordinate Geographical location
 * @property temperature Ground temperature in Celsius
 * @property fieldMetrics On-site measurement results
 * @property labMetrics Laboratory-verified analysis results
 * @property chemicalComposition Detailed chemical components
 */
@Parcelize
data class ThermalPoint(
    @SerializedName("id") val id: String = "",
    @SerializedName("coord_y") val latitude: Double = 0.0,
    @SerializedName("coord_x") val longitude: Double = 0.0,
    @SerializedName("temp") val temperature: Double = 0.0,
    @SerializedName("pH_campo") val fieldPh: Double = 0.0,
    @SerializedName("cond_campo") val fieldCond: Int = 0,
    @SerializedName("pH_lab") val labPh: Double = 0.0,
    @SerializedName("cond_lab") val labCond: Int = 0,
    @SerializedName("Cl") val chlorine: Double = 0.0,
    @SerializedName("Ca+") val calcium: Double = 0.0,
    @SerializedName("HCO3") val mgBicarbonate: Double = 0.0,
    @SerializedName("SO4") val sulfate: Double = 0.0,
    @SerializedName("Fe") val iron: String = "",
    @SerializedName("Si") val silicon: Int = 0,
    @SerializedName("B") val boron: String = "",
    @SerializedName("Li") val lithium: String = "",
    @SerializedName("F") val fluorine: String = "",
    @SerializedName("Na") val sodium: Double = 0.0,
    @SerializedName("K") val potassium: Double = 0.0,
    @SerializedName("MG+") val magnesiumIon: Double = 0.0
) : Parcelable {

    /**
     * Factory method to create ThermalPoint from API coordinates
     */
    companion object {
        fun fromCoordinates(
            id: String = "",
            latitude: Double = 0.0,
            longitude: Double = 0.0,
            temperature: Double = 0.0,
            fieldPh: Double = 0.0,
            fieldCond: Int = 0,
            labPh: Double = 0.0,
            labCond: Int = 0
        ): ThermalPoint {
            return ThermalPoint(
                id = id,
                latitude = latitude,
                longitude = longitude,
                temperature = temperature,
                fieldPh = fieldPh,
                fieldCond = fieldCond,
                labPh = labPh,
                labCond = labCond
            )
        }
    }

    /**
     * Convenience property to get coordinate object
     */
    val coordinate: GeoCoordinate
        get() = GeoCoordinate(latitude = latitude, longitude = longitude)

    /**
     * Convenience property to get field metrics
     */
    val fieldMetrics: FieldMetrics
        get() = FieldMetrics(ph = fieldPh, conductivity = fieldCond, temperature = temperature)

    /**
     * Convenience property to get lab metrics
     */
    val labMetrics: LabMetrics
        get() = LabMetrics(ph = labPh, conductivity = labCond)

    /**
     * Convenience property to get chemical composition
     */
    val chemicalComposition: ChemicalComposition
        get() = ChemicalComposition(
            chlorine = chlorine,
            calcium = calcium,
            bicarbonate = mgBicarbonate,
            sulfate = sulfate,
            iron = iron,
            silicon = silicon,
            boron = boron,
            lithium = lithium,
            fluorine = fluorine,
            sodium = sodium,
            potassium = potassium,
            magnesium = magnesiumIon
        )
}

/**
 * Container for field measurement data
 */
@Parcelize
data class FieldMetrics(
    val ph: Double = 0.0,
    val conductivity: Int = 0,
    val temperature: Double = 0.0
) : Parcelable

/**
 * Container for laboratory analysis data
 */
@Parcelize
data class LabMetrics(
    val ph: Double = 0.0,
    val conductivity: Int = 0
) : Parcelable

/**
 * Container for chemical composition data
 */
@Parcelize
data class ChemicalComposition(
    val chlorine: Double = 0.0,
    val calcium: Double = 0.0,
    val bicarbonate: Double = 0.0,
    val sulfate: Double = 0.0,
    val iron: String = "",
    val silicon: Int = 0,
    val boron: String = "",
    val lithium: String = "",
    val fluorine: String = "",
    val sodium: Double = 0.0,
    val potassium: Double = 0.0,
    val magnesium: Double = 0.0
) : Parcelable

/**
 * API response for thermal point queries
 */
data class ThermalPointResponse(
    @SerializedName("response") val response: String = "",
    @SerializedName("data") val points: List<ThermalPoint> = emptyList(),
    @SerializedName("errors") val errors: List<ApiError> = emptyList()
)