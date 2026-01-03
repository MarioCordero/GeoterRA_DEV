package com.inii.geoterra.development.api.requests.models

import android.os.Parcelable
import com.google.gson.annotations.SerializedName
import kotlinx.parcelize.Parcelize

/**
 * Complete geothermal analysis service request
 * @property id Unique request identifier
 * @property type Thermal manifestation type (Manantial/Fumarola)
 * @property region Administrative region name
 * @property date Request submission date
 * @property requester Contact information of requester
 * @property location Geographical and address information
 * @property siteCharacteristics Field observation data
 * @property laboratoryData Laboratory analysis results
 */
@Parcelize
data class AnalysisRequest(
    @SerializedName("id_soli") var id: String = "",
    @SerializedName("type") var type: ThermalManifestationType = ThermalManifestationType.SPRING,
    @SerializedName("region") var region: String = "",
    @SerializedName("fecha") var date: String = "",
    @SerializedName("email") var email: String = "",
    @SerializedName("propietario") var owner: String = "",
    @SerializedName("num_telefono") var contactNumber: String = "",
    @SerializedName("coord_x") var latitude: Double = 0.0,
    @SerializedName("coord_y") var longitude: Double = 0.0,
    @SerializedName("direccion") var address: String = "",
    @SerializedName("uso_actual") var currentUsage: String = "",
    @SerializedName("sens_termica") var thermalSensation: Int = 0,
    @SerializedName("burbujeo") var bubbles: Int = 0,
    @SerializedName("ph_campo") var fieldPh: Double = 0.0,
    @SerializedName("cond_campo") var fieldCond: Int = 0
) : Parcelable {

    /**
     * Secondary constructor that maps a RequestFormUiState
     * into a valid AnalysisRequest domain model.
     *
     * This constructor centralizes UI-to-domain transformation logic,
     * preventing duplication and reducing coupling at ViewModel level.
     *
     * @param state Current UI state from the request form
     */
    constructor(state: RequestFormUiState) : this(
        id = state.identifier,
        type = state.manifestationType,
        region = "Guanacaste", // TODO: Replace with dynamic region if needed
        date = state.date,
        email = "",
        owner = state.ownerName,
        contactNumber = state.ownerContact,
        latitude = state.latitude,
        longitude = state.longitude,
        address = state.details,
        currentUsage = state.currentUsage,
        thermalSensation = 1 // TODO: Map correctly once UI provides value
    )

    /**
     * Convenience property to get requester information
     */
    val requester: RequesterInfo
        get() = RequesterInfo(
            email = email,
            name = owner,
            phone = contactNumber
        )

    /**
     * Convenience property to get location information
     */
    val location: RequestLocation
        get() = RequestLocation(
            region = region,
            address = address,
            latitude = latitude,
            longitude = longitude
        )

    /**
     * Convenience property to get site characteristics
     */
    val siteCharacteristics: SiteCharacteristics
        get() = SiteCharacteristics(
            currentUsage = currentUsage,
            thermalSensation = thermalSensation,
            bubbles = bubbles
        )

    /**
     * Convenience property to get laboratory data
     */
    val laboratoryData: FieldLaboratoryData
        get() = FieldLaboratoryData(
            fieldPh = fieldPh,
            fieldCond = fieldCond
        )

    /**
     * Validates required fields for submission.
     *
     * @return ValidationResult containing validation status and error map
     */
    fun validate(): ValidationResult {
        // Mutable map to accumulate validation errors
        val errors = mutableMapOf<ValidationErrorKey, String>()

        // Validate identifier
        if (id.isBlank()) {
            errors[ValidationErrorKey.ID] = "Identificador inválido."
        }

        // Validate region
        if (region.isBlank()) {
            errors[ValidationErrorKey.REGION] = "Región inválida"
        }

        // Validate date
        if (date.isBlank()) {
            errors[ValidationErrorKey.DATE] = "Fecha inválida."
        }

        // Validate email
        if (email.isBlank()) {
            errors[ValidationErrorKey.EMAIL] = "Email inválido"
        }

        // Validate coordinates
        if (latitude.isNaN() || longitude.isNaN() && longitude != 0.0 && latitude != 0.0) {
            errors[ValidationErrorKey.COORDINATES] = "Coordenadas no especificadas."
        }

        return ValidationResult(
            isValid = errors.isEmpty(),
            errors = errors
        )
    }

}

/**
 * Types of thermal manifestations
 */
enum class ThermalManifestationType {
    @SerializedName("Manantial")
    SPRING,

    @SerializedName("Fumarola")
    FUMAROLE,

    @SerializedName("")
    UNKNOWN;

    companion object {
        fun fromString(value: String): ThermalManifestationType {
            return when (value) {
                "Manantial" -> SPRING
                "Fumarola" -> FUMAROLE
                else -> UNKNOWN
            }
        }
    }
}

/**
 * Represents the full UI state of the request form.
 */
data class RequestFormUiState(
    val identifier: String = "",
    val region: String = "",
    val date: String = "",
    val ownerName: String = "",
    val ownerContact: String = "",
    val currentUsage: String = "",
    val manifestationType : ThermalManifestationType = ThermalManifestationType.SPRING,
    val details: String = "",
    val latitude: Double = 0.0,
    val longitude: Double = 0.0
) {
    constructor(analysis: AnalysisRequest) : this(
        identifier = analysis.id,
        region = analysis.region,
        date = analysis.date,
        ownerName = analysis.owner,
        ownerContact = analysis.contactNumber,
        currentUsage = analysis.currentUsage,
        manifestationType = ThermalManifestationType.SPRING,
        details = analysis.address,
        latitude = analysis.latitude,
        longitude = analysis.longitude,
    )
}

/**
 * Enumeration of validation error types.
 *
 * Each value represents a specific field or validation rule.
 */
enum class ValidationErrorKey {
    ID,
    REGION,
    DATE,
    EMAIL,
    COORDINATES
}

/**
 * Result of payload validation
 */
@Parcelize
data class ValidationResult(
    val isValid: Boolean = false,
    val errors: Map<ValidationErrorKey, String>
) : Parcelable

/**
 * Container for requester contact information
 */
@Parcelize
data class RequesterInfo(
    val email: String = "",
    val name: String = "",
    val phone: String = ""
) : Parcelable

/**
 * Container for geographical location data
 */
@Parcelize
data class RequestLocation(
    val region: String = "",
    val address: String = "",
    val latitude: Double = 0.0,
    val longitude: Double = 0.0
) : Parcelable

/**
 * Container for field observation characteristics
 */
@Parcelize
data class SiteCharacteristics(
    val currentUsage: String = "",
    val thermalSensation: Int = 0,
    val bubbles: Int = 0
) : Parcelable

/**
 * Container for field laboratory measurements
 */
@Parcelize
data class FieldLaboratoryData(
    val fieldPh: Double = 0.0,
    val fieldCond: Int = 0
) : Parcelable

