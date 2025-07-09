<?php
    require_once 'cors.inc.php';
    if (session_status() == PHP_SESSION_NONE) {
        session_start();
    }
    
    // Debug information
    $debug = [
        'session_id' => session_id(),
        'session_status' => session_status(),
        'session_data' => $_SESSION,
        'cookies_received' => $_COOKIE,
        'session_user_set' => isset($_SESSION['user']),
        'session_user_value' => $_SESSION['user'] ?? null,
        'session_save_path' => session_save_path(),
        'session_name' => session_name()
    ];
    
    if (isset($_SESSION['user'])) {
        echo json_encode([
            'status' => 'logged_in',
            'user' => $_SESSION['user'],
            'debug' => $debug
        ]);
    } else {
        echo json_encode([
            'status' => 'not_logged_in',
            'debug' => $debug
        ]);
    }
?>