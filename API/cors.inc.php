<?php
    // Get the origin first to determine cookie domain
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $allowed_origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost",
        "http://geoterra.com:5173",
        "http://geoterra.com",
        "https://163.178.171.105",
        "http://163.178.171.105",
        'http://localhost:3000',    // Keep for backward compatibility
        'http://127.0.0.1:3000'
    ];

    // Dynamic cookie domain based on origin
    $cookie_domain = '';
    if (strpos($origin, 'localhost') !== false) {
        // For localhost origins, don't set a domain (will default to localhost)
        $cookie_domain = '';
    } else {
        // For production domains
        $cookie_domain = 'geoterra.com';
    }

    // Session configuration - dynamic based on environment
    ini_set('session.cookie_httponly', 0); // 0 for debugging, change to 1 in production
    ini_set('session.cookie_secure', 0); // Set to 1 if using HTTPS
    ini_set('session.cookie_samesite', 'Lax');
    if ($cookie_domain !== '') {
        ini_set('session.cookie_domain', $cookie_domain);
    }
    ini_set('session.cookie_path', '/');

    // Clear any existing CORS headers to avoid conflicts
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

    // Enhanced debug info about CORS and cookies
    function debugCorsAndCookies() {
        global $cookie_domain, $origin;
        return [
            'determined_cookie_domain' => $cookie_domain,
            'origin_used' => $origin,
            'php_session_cookie' => $_COOKIE[session_name()] ?? null,
            'all_cookies' => $_COOKIE,
            'origin_header' => $_SERVER['HTTP_ORIGIN'] ?? null,
            'referer_header' => $_SERVER['HTTP_REFERER'] ?? null,
            'host_header' => $_SERVER['HTTP_HOST'] ?? null,
            'request_method' => $_SERVER['REQUEST_METHOD'] ?? null,
            'cookie_params' => session_get_cookie_params(),
            'session_id' => session_id(),
            'session_status' => session_status()
        ];
    }

    // Log CORS debug info (check your PHP error log)
    error_log("CORS Debug: " . json_encode(debugCorsAndCookies()));
?>