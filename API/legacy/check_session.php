<?php
    require_once 'cors.inc.php';
    
    // Check if session token was sent in header (for cross-origin requests)
    $session_token = $_SERVER['HTTP_X_SESSION_TOKEN'] ?? null;

    if ($session_token) {
        // Resume existing session using the token
        session_id($session_token);
    }
    
    // Enhanced session configuration
    if (session_status() == PHP_SESSION_NONE) {
        // Set session cookie parameters before starting session
        session_set_cookie_params([
            'lifetime' => 0,           // Session cookie (expires when browser closes)
            'path' => '/',             // Available for entire domain
            'domain' => '',            // Current domain (leave empty for auto-detection)
            'secure' => false,         // Set to true if using HTTPS in production
            'httponly' => true,        // Prevent JavaScript access for security
            'samesite' => 'Lax'        // CSRF protection
        ]);
        
        // Optional: Custom session name
        session_name('GEOTERRA_SESSION');
        
        session_start();
    }
    
    // Comprehensive debug information
    $debug = [
        'session_id' => session_id(),
        'session_token_received' => $session_token,
        'session_method' => $session_token ? 'token_header' : 'cookie',
        'session_status' => session_status(),
        'session_status_text' => [
            PHP_SESSION_DISABLED => 'PHP_SESSION_DISABLED',
            PHP_SESSION_NONE => 'PHP_SESSION_NONE', 
            PHP_SESSION_ACTIVE => 'PHP_SESSION_ACTIVE'
        ][session_status()] ?? 'UNKNOWN',
        'session_data' => $_SESSION,
        'cookies_received' => $_COOKIE,
        'session_user_set' => isset($_SESSION['user']),
        'session_user_value' => $_SESSION['user'] ?? null,
        'session_save_path' => session_save_path(),
        'session_name' => session_name(),
        'cookie_params' => session_get_cookie_params(),
        'php_session_cookie' => $_COOKIE[session_name()] ?? null,
        'headers_sent' => headers_sent(),
        'server_info' => [
            'host' => $_SERVER['HTTP_HOST'] ?? 'unknown',
            'protocol' => isset($_SERVER['HTTPS']) ? 'https' : 'http',
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
            'remote_addr' => $_SERVER['REMOTE_ADDR'] ?? 'unknown'
        ],
        'session_file_exists' => file_exists(session_save_path() . '/sess_' . session_id()),
        'session_save_path_writable' => is_writable(session_save_path())
    ];
    
    $apiResponse = [
        "response" => "Error",
        "message" => "",
        "errors" => [],
        "data" => [],
        "debug" => $debug
    ];
    
    // Enhanced session validation
    if (isset($_SESSION['user']) && !empty($_SESSION['user'])) {
        try {
            // Query database to get user type
            require_once 'dbhandler.inc.php';
            
            $user_email = $_SESSION['user'];
            $stmt = $pdo->prepare("SELECT rol FROM reg_usr WHERE email = ?");
            $stmt->execute([$user_email]);
            $user_data = $stmt->fetch();
            
            if ($user_data) {
                $apiResponse["response"] = "Ok";
                $apiResponse["message"] = "Session is active";
                $apiResponse["data"] = [
                    'status' => 'logged_in',
                    'user' => $_SESSION['user'],
                    'user_type' => $user_data['rol'] ?? 'usr',
                    'is_admin' => ($user_data['rol'] === 'admin'),
                    'admin' => ($user_data['rol'] === 'admin'),
                    'session_age' => time() - ($_SESSION['login_time'] ?? time()),
                    'last_activity' => $_SESSION['last_activity'] ?? null
                ];
                
                // Update last activity timestamp
                $_SESSION['last_activity'] = time();
                
            } else {
                // User exists in session but not in database - invalid session
                $apiResponse["response"] = "Error";
                $apiResponse["message"] = "Invalid session - user not found";
                $apiResponse["errors"][] = "User exists in session but not in database";
                $apiResponse["data"] = [
                    'status' => 'invalid_session',
                    'reason' => 'user_not_found_in_db'
                ];
                
                // Clean up invalid session
                session_destroy();
            }
            
        } catch (Exception $e) {
            $apiResponse["response"] = "Error";
            $apiResponse["message"] = "Database error during session validation";
            $apiResponse["errors"][] = "Database connection or query failed: " . $e->getMessage();
            $apiResponse["data"] = [
                'status' => 'error',
                'reason' => 'database_error'
            ];
        }
        
    } else {
        $apiResponse["response"] = "Error";
        $apiResponse["message"] = "No active session";
        $apiResponse["errors"][] = "User not logged in";
        $apiResponse["data"] = [
            'status' => 'not_logged_in',
            'reason' => empty($_SESSION) ? 'no_session_data' : 'no_user_in_session'
        ];
    }
    
    header("Content-Type: application/json");
    echo json_encode($apiResponse, JSON_PRETTY_PRINT);
?>