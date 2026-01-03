package com.inii.geoterra.development.api.geospatial

import com.inii.geoterra.development.api.geospatial.models.ThermalPointResponse
import retrofit2.Call
import retrofit2.http.Field
import retrofit2.http.FormUrlEncoded
import retrofit2.http.POST

/**
 * Geospatial data service for thermal point information
 */
interface GeospatialService {

    /**
     * Retrieves thermal points for specified geographical region
     * @param region Administrative region identifier
     * @return List of thermal points with analysis data
     */
    @FormUrlEncoded
    @POST("map_data.inc.php")
    fun fetchThermalPoints(
        @Field("region") region: String
    ): Call<ThermalPointResponse>
}