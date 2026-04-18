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

      // Parse and validate request
      $data = Request::parseJsonRequest();
      $dto = LoginUserDTO::fromArray($data);
      $result = $this->authService->login($dto);

    if (Request::isMobile()) {
      $this->respondMobile($result);
    } else {
      $this->respondWeb($result);
    }

    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getCode());
    } catch (\Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  private function respondWeb(array $result): void
  {
      // $expiresIn = $result['meta']['expires_in'] ?? 5400;

      // setcookie('geoterra_session_token', $result['data']['access_token'], [
      //     'expires' => time() + $expiresIn,
      //     'httponly' => true,
      //     'secure' => true, // Siempre recomendado en este nuevo esquema
      //     'samesite' => 'Lax'
      // ]);

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

    $responseData = $this->filterResponse($result, 'cookie');

    // Return response WITHOUT refresh_token in body (only in cookie)
    Response::success(
      $responseData, [
        'token_type' => 'Cookie',
        'expires_in' => $expiresIn,
        'message' => 'Session set via HTTP-only cookie'
      ], 200
    );
  }

  /**
   * Prepara la respuesta para Apps Móviles (Bearer)
   */
  private function respondMobile(array $result): void
  {
    $responseData = $this->filterResponse($result, 'bearer');
    
    Response::success($responseData, [
        'token_type' => 'Bearer',
        'expires_in' => 5400,
        'refresh_expires_in' => 2592000
    ], 200);
  }

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

      // Detect client platform and respond accordingly
      if (Request::isMobile()) {
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