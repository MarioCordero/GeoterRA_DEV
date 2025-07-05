<?php
    // Ensure session is started with secure settings
    if (session_status() == PHP_SESSION_NONE) {
        ini_set('session.use_only_cookies', 1);
        ini_set('session.use_strict_mode', 1);

        session_set_cookie_params([
            'lifetime' => 1800,
            'path' => '/',
            // 'domain' => '163.178.171.105', // Uncomment and set if you have a fixed domain
            'secure' => false, // Use true ONLY if you have HTTPS
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