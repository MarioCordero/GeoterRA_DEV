<?php
declare(strict_types=1);

use Services\AuthService;
use Http\Request;
use Core\Logger;

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

        Logger::info(sprintf('✅ [Session] User %s authenticated via %s', 
            $userData['email'], Request::getPlatform()));

    } catch (\Exception $e) {
        Logger::debug('info [Session] Anonymous access or invalid token');
    }
}