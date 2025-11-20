<?php
// Add CORS headers first
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Session-Token");
header("Access-Control-Allow-Credentials: true");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Include your CORS file if it exists
if (file_exists('cors.inc.php')) {
    require_once 'cors.inc.php';
}

// Same session configuration as check_session.php
if (session_status() == PHP_SESSION_NONE) {
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'domain' => '',  // Leave empty
        'secure' => false,
        'httponly' => false,  // Allow JavaScript access
        'samesite' => 'Lax'   // Keep Lax for HTTP
    ]);
    
    session_name('GEOTERRA_SESSION');
    session_start();
}

// Increment counter for testing persistence
if (!isset($_SESSION['counter'])) {
    $_SESSION['counter'] = 1;
} else {
    $_SESSION['counter']++;
}

// Force session regeneration for testing if no session cookie received
if (empty($_COOKIE[session_name()])) {
    // Explicitly set the session cookie since PHP might not be doing it automatically
    $cookie_name = session_name();
    $cookie_value = session_id();
    $cookie_params = session_get_cookie_params();
    
    // Manual cookie setting with explicit parameters
    setcookie(
        $cookie_name,
        $cookie_value,
        [
            'expires' => $cookie_params['lifetime'] > 0 ? time() + $cookie_params['lifetime'] : 0,
            'path' => $cookie_params['path'],
            'domain' => $cookie_params['domain'],
            'secure' => $cookie_params['secure'],
            'httponly' => $cookie_params['httponly'],
            'samesite' => $cookie_params['samesite']
        ]
    );
}

// Also try to set with JavaScript-accessible cookie for cross-origin testing
setcookie('GEOTERRA_SESSION_JS', session_id(), [
    'expires' => 0,
    'path' => '/',
    'domain' => '',
    'secure' => false,
    'httponly' => false,
    'samesite' => 'Lax'
]);

// Get all response headers that will be sent
$response_headers = [];
if (function_exists('headers_list')) {
    $response_headers = headers_list();
}

$response = [
    'session_id' => session_id(),
    'counter' => $_SESSION['counter'],
    'session_data' => $_SESSION,
    'cookies_received' => $_COOKIE,
    'php_session_name' => session_name(),
    'cookie_params' => session_get_cookie_params(),
    'headers_sent' => headers_sent(),
    'session_status' => session_status(),
    'session_save_path' => session_save_path(),
    'domain' => $_SERVER['HTTP_HOST'] ?? 'unknown',
    'protocol' => isset($_SERVER['HTTPS']) ? 'https' : 'http',
    'session_file_exists' => file_exists(session_save_path() . '/sess_' . session_id()),
    'session_save_path_writable' => is_writable(session_save_path()),
    'all_headers' => getallheaders(),
    'request_method' => $_SERVER['REQUEST_METHOD'],
    'response_headers' => $response_headers,
    'session_cookie_sent' => !empty($_COOKIE[session_name()]),
    'php_version' => PHP_VERSION,
    'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'unknown',
    // Add session token that can be used manually
    'session_token' => session_id(),
    'cross_origin_issue' => 'Browser may be blocking cross-origin cookies between localhost:5173 and geoterra.com'
];

header('Content-Type: application/json');
echo json_encode($response, JSON_PRETTY_PRINT);
?>