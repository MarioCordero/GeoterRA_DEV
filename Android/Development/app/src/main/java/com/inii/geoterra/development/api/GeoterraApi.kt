package com.inii.geoterra.development.api

import com.inii.geoterra.development.api.authentication.AuthService
import com.inii.geoterra.development.api.geospatial.GeospatialService
import com.inii.geoterra.development.api.requests.RequestService

/**
 * Main API interface aggregating all GeoTerra services
 * Provides access to authentication, geospatial, and request services
 */
interface GeoTerraApi : AuthService, GeospatialService, RequestService