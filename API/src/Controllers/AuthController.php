<?php
// src/Controllers/AuthController.php
declare(strict_types=1);

namespace Controllers;

use DTO\LoginUserDTO;
use Http\ApiException;
use Http\ClientDetector;
use Http\Request;
use Http\Response;
use Http\ErrorType;
use Services\AuthService;

/**
 * Handles authentication-related operations for both web and mobile clients.
 *
 * - Web Browsers: HTTP-only cookies for session persistence
 * - Mobile Apps (Kotlin): Bearer tokens in Authorization header
 *
 * Platform detection is automatic via User-Agent and custom headers.
 */
final class AuthController
{
  private AuthService $authService;

  public function __construct(private \PDO $pdo)
  {
    $this->authService = new AuthService($this->pdo);
  }

  /**
   * POST /auth/login
   * Authenticates a user and returns appropriate credentials based on client type.
   *
   * - Web Browser: Sets HTTP-only cookie, returns minimal tokens in response
   * - Mobile App: Returns both tokens in response body for local storage
   */
  public function login(): void
  {
    try {
      // Parse and validate request
      $data = Request::parseJsonRequest();
      $dto = LoginUserDTO::fromArray($data);
      $result = $this->authService->login($dto);

      // Detect client platform
      $clientDetector = new ClientDetector();

      if ($clientDetector->isMobileApp()) {
        $this->loginMobileClient($result, $clientDetector);
      } else {
        $this->loginWebClient($result, $clientDetector);
      }

    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getCode());
    } catch (\Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * Handle web browser login - set HTTP-only cookie.
   */
  private function loginWebClient(array $result, ClientDetector $clientDetector): void
  {
    $accessToken = $result['data']['access_token'];
    $expiresIn = $result['meta']['expires_in'] ?? 5400;

    // Set HTTP-only cookie for browser
    setcookie('geoterra_session_token', $accessToken, [
      'expires' => time() + $expiresIn,
      'path' => '/',
      'domain' => '',
      'secure' => $this->isSecureContext(),
      'httponly' => true,
      'samesite' => 'Lax'
    ]);

    error_log(sprintf(
      '✅ [Auth] Browser login successful: %s (IP: %s)',
      $result['data']['email'],
      $_SERVER['REMOTE_ADDR'] ?? 'unknown'
    ));

    // Return response WITHOUT refresh_token in body (only in cookie)
    Response::success([
      'access_token' => $accessToken,
      'user_id' => $result['data']['user_id'],
      'email' => $result['data']['email'],
      'name' => $result['data']['name'],
      'role' => $result['data']['role'],
      'is_admin' => $result['data']['is_admin'],
      'authentication_method' => 'cookie',
    ], [
      'token_type' => 'Cookie',
      'expires_in' => $expiresIn,
      'message' => 'Session token set in HTTP-only cookie'
    ], 200);
  }

  /**
   * Handle mobile app login - return bearer tokens in response body.
   */
  private function loginMobileClient(array $result, ClientDetector $clientDetector): void
  {
    $accessToken = $result['data']['access_token'];
    $refreshToken = $result['data']['refresh_token'];

    error_log(sprintf(
      '✅ [Auth] Mobile app login successful: %s (App: %s v%s, IP: %s)',
      $result['data']['email'],
      $clientDetector->getAppName() ?? 'Unknown',
      $clientDetector->getAppVersion() ?? 'unknown',
      $_SERVER['REMOTE_ADDR'] ?? 'unknown'
    ));

    // Return tokens in response body for mobile app
    Response::success([
      'access_token' => $accessToken,
      'refresh_token' => $refreshToken,
      'user_id' => $result['data']['user_id'],
      'email' => $result['data']['email'],
      'name' => $result['data']['name'],
      'role' => $result['data']['role'],
      'is_admin' => $result['data']['is_admin'],
      'authentication_method' => 'bearer_token',
    ], [
      'token_type' => 'Bearer',
      'expires_in' => 5400,
      'refresh_expires_in' => 2592000,
      'message' => 'Use access_token in Authorization header: "Bearer <token>"'
    ], 200);
  }

  /**
   * POST /auth/logout
   * Revokes current session and logs out user (both web and mobile).
   */
  public function logout(): void
  {
    try {
      $user = Request::getUser();
      if (!$user) {
        throw new ApiException(
          ErrorType::unauthorized('Not authenticated'),
          401
        );
      }

      // Logout (revoke tokens in database)
      $this->authService->logout();

      // Detect client platform
      $clientDetector = new ClientDetector();

      if ($clientDetector->isMobileApp()) {
        error_log(sprintf(
          '✅ [Auth] Mobile app logout successful: %s',
          $user['email']
        ));
      } else {
        // Web browser: delete cookie
        setcookie('geoterra_session_token', '', [
          'expires' => time() - 3600,
          'path' => '/',
          'samesite' => 'Lax'
        ]);

        error_log(sprintf(
          '✅ [Auth] Browser logout successful: %s',
          $user['email']
        ));
      }

      Response::success([
        'logged_out' => true,
        'message' => 'Successfully logged out'
      ], null, 200);

    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getCode());
    } catch (\Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * POST /auth/refresh
   * Rotates tokens for both web and mobile clients.
   */
  public function refresh(): void
  {
    try {
      $clientDetector = new ClientDetector();

      if ($clientDetector->isMobileApp()) {
        $this->refreshMobileClient();
      } else {
        $this->refreshWebClient();
      }

    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getCode());
    } catch (\Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * Handle token refresh for web browser.
   * Browser typically doesn't refresh manually - this validates current session.
   */
  private function refreshWebClient(): void
  {
    // Web browser typically doesn't refresh manually
    // Just validate current cookie is still valid
    $user = Request::getUser();
    if (!$user) {
      throw new ApiException(
        ErrorType::unauthorized('Session expired, please login again'),
        401
      );
    }

    error_log(sprintf(
      '🔄 [Auth] Browser session refresh validated: %s',
      $user['email']
    ));

    Response::success([
      'message' => 'Session is still valid',
      'user_id' => $user['user_id']
    ], null, 200);
  }

  /**
   * Handle token refresh for mobile app.
   * Receives refresh token, issues new access token and new refresh token.
   */
  private function refreshMobileClient(): void
  {
    $data = Request::parseJsonRequest();
    $refreshToken = $data['refresh_token'] ?? null;

    if (!$refreshToken) {
      throw new ApiException(
        ErrorType::missingField('refresh_token'),
        400
      );
    }

    // Refresh tokens
    $result = $this->authService->refreshTokens($refreshToken);

    error_log(sprintf(
      '🔄 [Auth] Mobile app tokens refreshed: %s',
      $result['data']['user_id']
    ));

    Response::success([
      'access_token' => $result['data']['access_token'],
      'refresh_token' => $result['data']['refresh_token'],
      'user_id' => $result['data']['user_id'],
      'authentication_method' => 'bearer_token',
    ], [
      'token_type' => 'Bearer',
      'expires_in' => 5400,
      'refresh_expires_in' => 2592000,
    ], 200);
  }

  /**
   * Helper: Check if running in secure context (HTTPS).
   */
  private function isSecureContext(): bool
  {
    return isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on';
  }
}