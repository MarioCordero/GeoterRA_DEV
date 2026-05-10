<?php
// src/Core/OpenApiConfig.php
namespace Core;

use OpenApi\Attributes as OA;

#[OA\Info(title: "GeoterRA API", version: "1.0.0", description: "API para la gestión de puntos geográficos")]
#[OA\Server(url: "http://localhost:8000", description: "Servidor Local")]

// Definición de Seguridad para el generador de Postman
#[OA\SecurityScheme(
    securityScheme: "cookieAuth",
    type: "apiKey",
    in: "cookie",
    name: "session_token"
)]
#[OA\SecurityScheme(
    securityScheme: "tokenAuth",
    type: "http",
    scheme: "bearer"
)]
class OpenApiConfig {}