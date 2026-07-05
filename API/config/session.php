<?php
declare(strict_types=1);

use Services\AuthService;
use Repositories\UserRepository;
use Http\Request;

/**
 * Validates the authentication state for the current request.
 * 
 * This function attempts to identify the user by checking for a session token 
 * in the 'sigecat_session_token' cookie or a Bearer token in the 'Authorization' header.
 * If a valid session is found, the user context is attached to the global Request state.
 * 
 * @param PDO $db The active database connection required by the AuthService.
 * @return void
 */
function validateSessionToken(PDO $db): void
{
  $headers = getallheaders();

  $authorization = $headers['Authorization'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? '';
  $sessionToken = $_COOKIE['geoterra_session_token'] ?? null;
  
  error_log('[Session] Token exists: ' . ($sessionToken ? 'YES' : 'NO'));
  error_log('[Session] All cookies: ' . json_encode($_COOKIE));

  if (!$sessionToken && !str_starts_with($authorization, 'Bearer ')) {
    return;
  }

  try {
    $authService = new AuthService($db);
    $user = $authService->requireAuth();
    Request::setUser($user);
  } catch (Exception $e) {
    /**
     * Authentication failures are logged but not fatal here, 
     * as some endpoints might allow public access. 
     * Protected routes should verify Request::isAuthenticated() later.
     */
    error_log('[Session] Invalid token: ' . $e->getMessage());
  }
}