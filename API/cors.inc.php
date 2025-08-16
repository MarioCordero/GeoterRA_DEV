<?php
    // More aggressive header clearing
    if (function_exists('header_remove')) {
        header_remove('Access-Control-Allow-Origin');
        header_remove('Access-Control-Allow-Credentials');
        header_remove('Access-Control-Allow-Methods');
        header_remove('Access-Control-Allow-Headers');
    }
    
    // Also try to clear any previously set headers
    if (function_exists('headers_list')) {
        $headers = headers_list();
        foreach ($headers as $header) {
            if (stripos($header, 'Access-Control-Allow-Origin') !== false) {
                header_remove('Access-Control-Allow-Origin');
            }
        }
    }

    // Get the origin
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $allowed_origins = [
        "http://localhost:5173",
        "http://localhost",
        "http://geoterra.com:5173",
        "http://geoterra.com",
        "https://163.178.171.105",
        "http://163.178.171.105"
    ];
    
    // Only allow specific origins when using credentials
    if (in_array($origin, $allowed_origins)) {
        header("Access-Control-Allow-Origin: $origin");
        header("Access-Control-Allow-Credentials: true");
    }

    // Handle preflight OPTIONS request
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        if (in_array($origin, $allowed_origins)) {
            header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
            header("Access-Control-Allow-Headers: Content-Type, Authorization");
            header("Access-Control-Max-Age: 86400");
        }
        http_response_code(204);
        exit(0);
    }
?>