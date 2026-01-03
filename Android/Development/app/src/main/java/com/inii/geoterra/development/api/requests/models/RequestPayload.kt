package com.inii.geoterra.development.api.requests.models

import android.os.Parcelable
import com.inii.geoterra.development.api.common.models.ApiError
import kotlinx.parcelize.Parcelize

/**
 * Data transfer object for creating new analysis requests
 * @property id Unique point identifier
 * @property region Administrative region name
 * @property date Request date in YYYY-MM-DD format
 * @property requester Contact information
 * @property location Geographical coordinates
 * @property characteristics Field observations
 */
@Parcelize
data class AnalysisRequestPayload(
    var id: String = "",
    var region: String = "",
    var date: String = "",
    var email: String = "",
    var owner: String = "",
    var currentUsage: String = "",
    var details: String = "",
    var ownerContact: String = "",
    var coordinates: String = "",
    var thermalSensation: Int = -1,
    var bubbles: Int = -1,
    var latitude: String = "",
    var longitude: String = ""
) : Parcelable {

    /**
     * Converts payload to formatted coordinate string
     */
    fun toFormattedCoordinates(): String {
        return if (latitude.isNotBlank() && longitude.isNotBlank()) {
            "$latitude, $longitude"
        } else {
            coordinates
        }
    }

}

