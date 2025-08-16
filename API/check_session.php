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
    
    $apiResponse = [
        "response" => "Error",
        "message" => "",
        "errors" => [],
        "data" => [],
        "debug" => $debug
    ];
    
    if (isset($_SESSION['user'])) {
        // Query database to get user type
        require_once 'dbhandler.inc.php'; // Use consistent DB connection file
        
        $user_email = $_SESSION['user'];
        $stmt = $pdo->prepare("SELECT rol FROM reg_usr WHERE email = ?"); // Use existing table structure
        $stmt->execute([$user_email]);
        $user_data = $stmt->fetch();
        
        $apiResponse["response"] = "Ok";
        $apiResponse["message"] = "Session is active";
        $apiResponse["data"] = [
            'status' => 'logged_in',
            'user' => $_SESSION['user'],
            'user_type' => $user_data['rol'] ?? 'usr',
            'is_admin' => ($user_data['rol'] === 'admin'),
            'admin' => ($user_data['rol'] === 'admin')
        ];
        
    } else {
        $apiResponse["response"] = "Error";
        $apiResponse["message"] = "No active session";
        $apiResponse["errors"][] = "User not logged in";
        $apiResponse["data"] = [
            'status' => 'not_logged_in'
        ];
    }
    
    header("Content-Type: application/json");
    echo json_encode($apiResponse);
?>