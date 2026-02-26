<?php
    require_once 'cors.inc.php';
	if (session_status() == PHP_SESSION_NONE) {
        session_start();
    }

    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);

	// Erase cookies related to the session
	if (isset($_COOKIE[session_name()])) {
		setcookie(session_name(), '', time() - 3600, '/');
	}

	// Clear all session variables
	$_SESSION = [];

	// End the session
	session_destroy();

	// JSON response
	header('Content-Type: application/json');
	echo json_encode(['status' => 'logged_out', 'message' => 'Sesión cerrada correctamente']);
?>