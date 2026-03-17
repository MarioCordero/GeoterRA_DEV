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
 * Handles authentication-related operations.
 *
 * This controller groups user registration and login
 * under the same authentication domain boundary.
 */
final class AuthController
{
  private AuthService $authService;
  public function __construct(private \PDO $pdo)
  {
    $this->authService = new AuthService($this->pdo);
  }

  /**
   * POST /auth/refresh
   * Rotates refresh token and issues new access credentials.
   */
  public function refresh(): void
  {
    try {
      $body = Request::parseJsonRequest();
      if (empty($body['refresh_token'])) {
        throw new ApiException(ErrorType::missingField('refresh_token'),400);
      }
      $result = $this->authService->refreshTokens($body['refresh_token']);
      Response::success($result['data'], $result['meta'], 200);

    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getCode());
    } catch (\Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * POST /login
   * Authenticates a user and returns access credentials.
   */
  public function login(): void
  {
    try {
      $data = Request::parseJsonRequest();
      $dto = LoginUserDTO::fromArray($data);
      $result = $this->authService->login($dto);
      // Set the access token as an HTTP-only cookie for session management
      // TODO CHECK THIS VULNERABILITY
      setcookie('geoterra_session_token', $result['data']['access_token'], [
        'expires' => time() + ($result['meta']['expires_in'] ?? 3600),
        'path' => '/',
        'domain' => '',
        'secure' => false,  // ✅ OK para HTTP local
        'httponly' => true,
        'samesite' => 'Lax'  // ✅ CAMBIO: 'None' → 'Lax'
      ]);
      Response::success($result['data'], $result['meta'], 200);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getCode());
    } catch (\Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * POST /logout
   * Revokes the current user session.
   */
  public function logout(): void
  {
    try {
      $this->authService->logout();
      // Clean cookie
      setcookie('geoterra_session_token', '', [
        'expires' => time() - 3600,
        'path' => '/',
        'domain' => '',
        'secure' => false,  // ✅ OK para HTTP local
        'httponly' => true,
        'samesite' => 'Lax'  // ✅ CAMBIO: 'None' → 'Lax'
      ]);
      Response::success(['logged_out' => true], null, 200);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getCode());
    } catch (\Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }
}