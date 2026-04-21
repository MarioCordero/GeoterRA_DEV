<?php
declare(strict_types=1);

$allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://geoterra.com',
    'http://127.0.0.1:5173',
    'http://geoterra.com:5173',  // Add this - your current frontend URL
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, x-api-key');
    header('Access-Control-Max-Age: 86400');
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}