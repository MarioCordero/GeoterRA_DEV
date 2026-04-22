<?php
declare(strict_types=1);

require_once __DIR__ . '/../src/Core/EnvironmentDetector.php';

// Extract origin from request
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

// Dynamic origin detection - allow same-origin requests + whitelisted hosts
$currentOrigin = \Core\EnvironmentDetector::getCurrentOrigin();

$allowedOrigins = [
    // Development/localhost
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
    
    // Production domain (both HTTP and HTTPS)
    'http://geoterra.com',
    'http://geoterra.com:5173',
    'https://geoterra.com',
    'https://geoterra.com:5173',
    
    // Remote server (your public IP - adjust as needed)
    'http://163.178.171.105',
    'https://163.178.171.105',
];

// Always allow same-origin requests
$isAllowedOrigin = in_array($origin, $allowedOrigins) || $origin === $currentOrigin;

if ($isAllowedOrigin) {
    header("Access-Control-Allow-Origin: {$origin}");
    header('Access-Control-Allow-Credentials: true');  // Critical for cookies
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, x-api-key');
    header('Access-Control-Max-Age: 86400');
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}