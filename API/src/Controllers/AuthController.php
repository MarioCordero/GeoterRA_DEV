<?php
// src/Controllers/AuthController.php
declare(strict_types=1);

namespace Controllers;

use DTO\LoginUserDTO;
use Http\ApiException;
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
      $data = Request::parseJsonRequest();
      $dto = LoginUserDTO::fromArray($data);
      $result = $this->authService->login($dto);

      if (Request::isMobile()) {
        $responseData = $this->authService->prepareMobileResponse($result);
        Response::success($responseData, [
          'token_type' => 'Bearer',
          'expires_in' => 5400,
        ], 200);
      } else {
        $responseData = $this->authService->prepareWebResponse($result);
        Response::success($responseData, [
          'token_type' => 'Cookie',
          'expires_in' => 5400,
          'message' => 'Session set via HTTP-only cookie'
        ], 200);
      }

    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getCode());
    } catch (\Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  // ???? 

  private function filterResponse(array $result, string $method): array
  {
    $data = $result['data'];
    
    $baseResponse = [];

    if ($method === 'bearer') {
      $baseResponse['access_token']  = $data['access_token'];
      $baseResponse['refresh_token'] = $data['refresh_token'];
    } else {
      $baseResponse['user_id']      = $data['user_id'];
      $baseResponse['email']        = $data['email'];
      $baseResponse['name']         = $data['name'];
      $baseResponse['role']         = $data['role'];
      $baseResponse['is_admin']     = $data['is_admin'];
      $baseResponse['access_token'] = $data['access_token'];
    }

    return $baseResponse;
  }

  /**
   * POST /auth/logout
   * Revokes current session and logs out user (both web and mobile).
   * 
   * The AuthService handles both cookie and bearer token authentication.
   */
  public function logout(): void
  {
    try {
      // Logout handles both web (cookies) and mobile (bearer tokens)
      $this->authService->logout();

      // For web clients, delete the HTTP-only cookie
      if (!Request::isMobile()) {
        setcookie('geoterra_session_token', '', [
          'expires' => time() - 3600,
          'path' => '/',
          'samesite' => 'Lax'
        ]);

        error_log('✅ [Auth] Browser logout successful');
      } else {
        error_log('✅ [Auth] Mobile app logout successful');
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
      // Detect client platform and handle accordingly
      if (Request::isMobile()) {
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