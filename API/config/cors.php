<?php
declare(strict_types=1);

use Core\EnvironmentDetector;

require_once __DIR__ . '/../src/Core/EnvironmentDetector.php';

// Normalization for Reverse Proxies / SSL termination before doing any calculation
if (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https') {
    $_SERVER['HTTPS'] = 'on';
    $_SERVER['SERVER_PORT'] = 443;
}

// Extract origin from request
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

// Dynamic origin detection - allow same-origin requests + whitelisted hosts
$currentOrigin = EnvironmentDetector::getCurrentOrigin();

$allowedOrigins = [
    // Development/localhost
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',

    // Production UCR Institutional domain (HTTPS only)
    'https://geoterra.inii.ucr.ac.cr',

    // Remote server (HTTPS only)
    'https://163.178.171.105',
];

// Always allow same-origin requests
$isAllowedOrigin = in_array($origin, $allowedOrigins) || $origin === $currentOrigin;

if ($isAllowedOrigin) {
    header("Access-Control-Allow-Origin: {$origin}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, x-api-key');
    header('Access-Control-Max-Age: 86400');
    
    // For HTTPS with credentials, SameSite must be None
    if (EnvironmentDetector::isHttps()) {
        header('Access-Control-Allow-Private-Network: true');
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}