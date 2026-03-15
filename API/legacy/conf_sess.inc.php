<?php
    if (session_status() == PHP_SESSION_NONE) {
        ini_set('session.use_only_cookies', 1);
        ini_set('session.use_strict_mode', 1);

        session_set_cookie_params([
            'lifetime' => 1800,
            'path' => '/',
            'domain' => '', // Empty for cross-domain
            'secure' => false, // Set true if using HTTPS
            'httponly' => true,
            'samesite' => 'None' // Allow cross-domain cookies
        ]);
        
        session_start();
    }
?>