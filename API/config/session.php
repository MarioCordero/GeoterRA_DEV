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
        error_log('🔴 [Session] No token in cookie');
        return;
    }

    // Log the client connection details for debugging
    $clientIp = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';
    error_log("🔵 [Session] Client connected: IP=$clientIp, UserAgent=$userAgent");

    try {
        $authService = new AuthService($db);
        $tokenData = $authService->validateAccessToken($sessionToken);
        
        if (!$tokenData) {
            error_log('🔴 [Session] validateAccessToken returned null');
            return;
        }

        if (!isset($tokenData['user_id'])) {
            error_log('🔴 [Session] No user_id in tokenData: ' . json_encode($tokenData));
            return;
        }

        $userRepository = new UserRepository($db);
        $user = $userRepository->findById($tokenData['user_id']);
        
        if (!$user) {
            error_log('🔴 [Session] User not found: ' . $tokenData['user_id']);
            return;
        }

        \Http\Request::setUser($user);
        
    } catch (\Exception $e) {
        error_log('🔴 [Session] Exception: ' . $e->getMessage());
        error_log('🔴 [Session] Trace: ' . $e->getTraceAsString());
    }
}