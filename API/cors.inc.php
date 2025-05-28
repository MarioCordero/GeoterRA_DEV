<?php
    // Handle preflight OPTIONS request
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        header("Access-Control-Allow-Origin: " . ($_SERVER['HTTP_ORIGIN'] ?? '*'));
        header("Access-Control-Allow-Credentials: true");
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type, Authorization");
        header("Access-Control-Max-Age: 86400");
        http_response_code(204);
        exit(0);
    }

    // Allow requests from specific origins
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $allowed_origins = [
        "http://localhost:5173",
        "http://geoterra.com",
        "https://163.178.171.105"
    ];
    if (in_array($origin, $allowed_origins)) {
        header("Access-Control-Allow-Origin: $origin");
        header("Access-Control-Allow-Credentials: true");
    }
?>