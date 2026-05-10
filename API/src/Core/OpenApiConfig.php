<?php
namespace Core;

/**
 * @OA\Info(
 * title="GeoterRA API",
 * version="1.0.0",
 * description="API para la gestión de puntos geográficos y manifestación de puntos"
 * )
 * @OA\Server(
 * url="http://localhost:8000",
 * description="Servidor de Desarrollo Local"
 * )
 * * @OA\SecurityScheme(
 * securityScheme="cookieAuth",
 * type="apiKey",
 * in="cookie",
 * name="session_token",
 * description="Sesión para clientes Web vía HttpOnly Cookie"
 * )
 * * @OA\SecurityScheme(
 * securityScheme="tokenAuth",
 * type="http",
 * scheme="bearer",
 * bearerFormat="JWT",
 * description="Autenticación para App Android vía Token"
 * )
 */
class OpenApiConfig {}