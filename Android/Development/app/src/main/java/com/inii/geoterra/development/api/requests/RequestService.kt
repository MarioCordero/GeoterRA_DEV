package com.inii.geoterra.development.api.requests


import com.inii.geoterra.development.api.requests.models.RequestResponse
import com.inii.geoterra.development.api.requests.models.UserRequestsResponse
import retrofit2.Call
import retrofit2.http.*

/**
 * Service request management interface
 */
interface RequestService {

    /**
     * Retrieves user's submitted service requests
     * @param email User's email address
     * @return List of user's analysis requests
     */
    @FormUrlEncoded
    @POST("get_request.inc.php")
    fun fetchUserRequests(
        @Field("email") email: String
    ): Call<UserRequestsResponse>

    /**
     * Submits new geothermal analysis request
     * @param requestData Complete analysis request payload
     * @return Submission status and validation results
     */
    @FormUrlEncoded
    @POST("request.inc.php")
    fun submitAnalysisRequest(
        @Field("pointId") id: String,
        @Field("region") region: String,
        @Field("fecha") date: String,
        @Field("email") email: String,
        @Field("propietario") owner: String,
        @Field("usoActual") currentUsage: String,
        @Field("direccion") address: String,
        @Field("contactNumber") contactNumber: String,
        @Field("gps") coordinates: String,
        @Field("sensTermica") thermalSensation: Int,
        @Field("burbujeo") bubbles: Int,
        @Field("lat") latitude: Double,
        @Field("lng") longitude: Double
    ): Call<RequestResponse>
}