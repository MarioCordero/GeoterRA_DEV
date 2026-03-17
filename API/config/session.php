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
    
    error_log('🔍 [Session] Token exists: ' . ($sessionToken ? 'YES' : 'NO'));
    error_log('🔍 [Session] All cookies: ' . json_encode($_COOKIE));

    if (!$sessionToken) {
        error_log('🔴 [Session] No token in cookie');
        return;
    }

    try {
        $authService = new AuthService($db);
        $tokenData = $authService->validateAccessToken($sessionToken);
        
        error_log('✅ [Session] Token validated: ' . json_encode($tokenData));
        
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
        error_log('✅ [Session] User SET: ' . $user['user_id']);
        
    } catch (\Exception $e) {
        error_log('🔴 [Session] Exception: ' . $e->getMessage());
        error_log('🔴 [Session] Trace: ' . $e->getTraceAsString());
    }
}