<?php
declare(strict_types=1);

use Services\AuthService;
use Repositories\UserRepository;
use Http\ClientDetector;

/**
 * Validate session token (cookie or bearer token) and attach user to Request.
 * Automatically routes to appropriate validation based on client type.
 * Call this after autoloader is registered but before routing.
 */
function validateSessionToken(PDO $db): void
{
    try {
        // Detect client platform
        $clientDetector = new ClientDetector();
        $platformInfo = $clientDetector->getPlatformInfo();

        // Log the client connection details for debugging
        $clientIp = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        error_log(sprintf(
            '🔵 [Session] Client connected: Platform=%s, IP=%s, AppName=%s, AppVersion=%s',
            $platformInfo['platform'],
            $clientIp,
            $platformInfo['app_name'] ?? 'N/A',
            $platformInfo['app_version'] ?? 'N/A'
        ));

        // Route to appropriate validation method based on platform
        if ($clientDetector->isMobileApp()) {
            validateMobileAppToken($db, $clientDetector);
        } else {
            validateBrowserCookie($db, $clientDetector);
        }

    } catch (\Exception $e) {
        error_log('🔴 [Session] Exception: ' . $e->getMessage());
        error_log('🔴 [Session] Trace: ' . $e->getTraceAsString());
    }
}

/**
 * Validate browser cookie-based session.
 * Extracts token from HTTP-only cookie and validates it.
 */
function validateBrowserCookie(PDO $db, ClientDetector $clientDetector): void
{
    // Extract token from cookie
    $sessionToken = $_COOKIE['geoterra_session_token'] ?? null;

    if (!$sessionToken) {
        error_log('🔴 [Session] No token in browser cookie');
        return; // No token, user is anonymous
    }

    try {
        // Validate token
        $authService = new AuthService($db);
        $tokenData = $authService->validateAccessToken($sessionToken);

        if (!$tokenData) {
            error_log('🔴 [Session] Browser token validation returned null');
            return;
        }

        if (!isset($tokenData['user_id'])) {
            error_log('🔴 [Session] No user_id in browser tokenData: ' . json_encode($tokenData));
            return;
        }

        // Load user from database
        $userRepository = new UserRepository($db);
        $user = $userRepository->findById($tokenData['user_id']);

        if (!$user) {
            error_log('🔴 [Session] User not found for browser token: ' . $tokenData['user_id']);
            return;
        }

        // Make user available to controllers
        \Http\Request::setUser($user);

        // Log success
        error_log(sprintf(
            '✅ [Session] Browser session validated for user: %s (email: %s)',
            $user['user_id'],
            $user['email'] ?? 'unknown'
        ));

    } catch (\Exception $e) {
        error_log('🔴 [Session] Browser token validation error: ' . $e->getMessage());
    }
}

/**
 * Validate mobile app bearer token.
 * Extracts token from Authorization header and validates it.
 */
function validateMobileAppToken(PDO $db, ClientDetector $clientDetector): void
{
    // Extract bearer token from Authorization header
    $bearerToken = \Http\Request::getBearerToken();

    if (!$bearerToken) {
        error_log('🔴 [Session] No Bearer token in Authorization header');
        return; // No token, user is anonymous
    }

    try {
        // Validate token
        $authService = new AuthService($db);
        $tokenData = $authService->validateAccessToken($bearerToken);

        if (!$tokenData) {
            error_log('🔴 [Session] Mobile app token validation returned null');
            return;
        }

        if (!isset($tokenData['user_id'])) {
            error_log('🔴 [Session] No user_id in mobile tokenData: ' . json_encode($tokenData));
            return;
        }

        // Load user from database
        $userRepository = new UserRepository($db);
        $user = $userRepository->findById($tokenData['user_id']);

        if (!$user) {
            error_log('🔴 [Session] User not found for mobile token: ' . $tokenData['user_id']);
            return;
        }

        // Make user available to controllers
        \Http\Request::setUser($user);

        // Log success
        error_log(sprintf(
            '📱 [Session] Mobile app token validated: User=%s, App=%s v%s',
            $user['user_id'],
            $clientDetector->getAppName() ?? 'Unknown',
            $clientDetector->getAppVersion() ?? 'unknown'
        ));

    } catch (\Exception $e) {
        error_log('🔴 [Session] Mobile app token validation error: ' . $e->getMessage());
    }
}
