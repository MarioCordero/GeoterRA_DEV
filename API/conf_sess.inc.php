<?php
    require_once 'cors.inc.php'; // Include CORS configuration
    // Ensure session is started with secure settings
    if (session_status() == PHP_SESSION_NONE) {
        ini_set('session.use_only_cookies', 1);
        ini_set('session.use_strict_mode', 1);

        session_set_cookie_params([
            'lifetime' => 1800,
            'domain' => 'localhost',
            'path' => '/',
            'secure' => true,
            'httponly' => true
        ]);
        session_start();
    }

    // Regenerate session ID to prevent session fixation attacks
    if (!isset($_SESSION["last_regeneration"])) {
        regen_session_id();
    } else {
        $interval = 60 * 15;
        if (time() - $_SESSION["last_regeneration"] >= $interval) {
            regen_session_id();
        }
    }

    function regen_session_id(){

        session_regenerate_id();
        $_SESSION["last_regeneration"] = time();
            
    }
?>
