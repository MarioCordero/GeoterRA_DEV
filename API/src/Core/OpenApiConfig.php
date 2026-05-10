<?php
namespace Core;

use OpenApi\Annotations as OA;

/**
 * Global OpenAPI configuration for GeoterRA API
 * 
 * @OA\OpenApi(
 *   openapi="3.0.0"
 * )
 * @OA\Info(
 *   title="GeoterRA API",
 *   version="1.0.0",
 *   description="API para la gestión de puntos geográficos y manifestaciones geotérmicas desarrollada para el proyecto GeoterRA",
 *   contact=@OA\Contact(
 *     name="GeoterRA Development Team",
 *     url="https://geoterraproject.example.com"
 *   ),
 *   license=@OA\License(
 *     name="MIT License"
 *   )
 * )
 * @OA\Server(
 *   url="http://localhost:8000",
 *   description="Servidor de Desarrollo Local"
 * )
 * @OA\Server(
 *   url="https://api.geoterraproject.example.com",
 *   description="Servidor de Producción"
 * )
 * @OA\SecurityScheme(
 *   securityScheme="cookieAuth",
 *   type="apiKey",
 *   in="cookie",
 *   name="session_token",
 *   description="Sesión para clientes Web vía HttpOnly Cookie"
 * )
 * @OA\SecurityScheme(
 *   securityScheme="tokenAuth",
 *   type="http",
 *   scheme="bearer",
 *   bearerFormat="JWT",
 *   description="Autenticación para App Android vía Bearer Token"
 * )
 */
class OpenApiConfig {}