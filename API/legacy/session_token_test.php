<?php
// CORS headers
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Session-Token");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Check if session token was sent in header
$session_token = $_SERVER['HTTP_X_SESSION_TOKEN'] ?? null;

if ($session_token) {
    // Resume existing session using the token
    session_id($session_token);
}

// Start session
session_start();

// Increment counter
if (!isset($_SESSION['counter'])) {
    $_SESSION['counter'] = 1;
} else {
    $_SESSION['counter']++;
}

$response = [
    'session_id' => session_id(),
    'counter' => $_SESSION['counter'],
    'session_data' => $_SESSION,
    'token_received' => $session_token,
    'token_method' => $session_token ? 'header' : 'new_session',
    'success' => true,
    'message' => $session_token ? 'Session resumed from token' : 'New session created'
];

header('Content-Type: application/json');
echo json_encode($response, JSON_PRETTY_PRINT);
?>
