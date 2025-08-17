<?php
// Add CORS headers first
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
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
        'domain' => '',
        'secure' => false,
        'httponly' => true,
        'samesite' => 'Lax'
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
    'request_method' => $_SERVER['REQUEST_METHOD']
];

header('Content-Type: application/json');
echo json_encode($response, JSON_PRETTY_PRINT);
?>