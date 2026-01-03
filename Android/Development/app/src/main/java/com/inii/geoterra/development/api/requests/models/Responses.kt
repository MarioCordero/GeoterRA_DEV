package com.inii.geoterra.development.api.requests.models

import com.inii.geoterra.development.api.common.models.ApiError
import com.inii.geoterra.development.api.requests.models.AnalysisRequest

/**
 * API response for request submissions
 */
data class RequestResponse(
    val response: String = "",
    val errors: List<ApiError> = emptyList()
)

/**
 * API response for user request queries
 */
data class UserRequestsResponse(
    val response: String = "",
    val message: String = "",
    val data: List<AnalysisRequest> = emptyList(),
    val errors: List<String> = emptyList()
)