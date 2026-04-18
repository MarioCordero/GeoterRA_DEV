<?php
declare(strict_types=1);

use Services\AuthService;
use Http\Request;

function validateSessionToken(PDO $db): void
{
    Request::init();

    if (!Request::isValidClient()) {
        return;
    }

    $token = Request::getToken();
    if (!$token) return;

    try {
        $authService = new AuthService($db);
        $userData = $authService->requireAuth(); 
        
        Request::setUser($userData);

        error_log(sprintf('✅ [Session] User %s authenticated via %s', 
            $userData['email'], Request::getPlatform()));

    } catch (\Exception $e) {
        error_log('info [Session] Anonymous access or invalid token');
    }
}