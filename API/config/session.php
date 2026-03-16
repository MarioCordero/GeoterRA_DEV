<?php
declare(strict_types=1);

use Services\AuthService;
use Repositories\UserRepository;

/**
 * Validate session token from cookie and attach user to Request.
 * Call this after autoloader is registered but before routing.
 */
function validateSessionToken(PDO $db): void
{
    $sessionToken = $_COOKIE['geoterra_session_token'] ?? null;
    if (!$sessionToken) {
        return;
    }
    try {
        $authService = new AuthService($db);
        $tokenData = $authService->validateAccessToken($sessionToken);
        
        if (!$tokenData || !isset($tokenData['user_id'])) {
            error_log('DEBUG: Invalid tokenData');
            return;
        }

        $userRepository = new UserRepository($db);
        $user = $userRepository->findById($tokenData['user_id']);
        
        if ($user) {
            \Http\Request::setUser($user);
        }
    } catch (\Exception $e) {
        error_log('Session validation error: ' . $e->getMessage());
    }
}