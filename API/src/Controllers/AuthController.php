<?php

declare(strict_types=1);

namespace Controllers;

use DTO\LoginUserDTO;
use Http\ApiException;
use Http\ErrorType;
use Http\Request;
use Http\Response;
use Services\AuthService;

/**
 * Handles authentication operations for the REST API.
 *
 * This controller is responsible for user login, token refresh,
 * and logout. It uses HTTP‑only cookies for access token storage
 * (web client convenience) while expecting the refresh token to be
 * sent in the JSON request body for rotation operations.
 *
 * All methods return a standardised JSON response via the `Response`
 * helper and propagate business exceptions through `ApiException`.
 *
 * @package Controllers
 */
final class AuthController
{
  private AuthService $authService;

  /**
   * AuthController constructor.
   *
   * @param \PDO $pdo Active database connection (injected by the router).
   */
  public function __construct(private \PDO $pdo)
  {
    $this->authService = new AuthService($this->pdo);
  }

  /**
   * POST /login
   *
   * Authenticates a user with email and password.
   *
   * On success, returns the access token, refresh token, user details.
   * It sets an HTTP‑only cookie (`sigecat_session_token`) containing
   * the access token for web client convenience.
   *
   * @return void
   *
   * @throws ApiException Any authentication failure exception propagated from
   * the service layer.
   */
  public function login(): void
  {
    try {
      $data = Request::parseJsonRequest();
      $dto = LoginUserDTO::fromArray($data);
      $result = $this->authService->login($dto);

      // Set HTTP‑only cookie for the access token for web client convenience.
      $accessToken = $result['data']['access_token'] ?? '';
      $expiresIn = $result['meta']['expires_in'] ?? 3600;

      // Secure is set to false for development.
      setcookie(
        'geoterra_session_token',
        $accessToken,
        [
          'expires' => time() + $expiresIn,
          'path' => '/',
          'domain' => '',
          'secure' => false,
          'httponly' => true,
          'samesite' => 'Lax'
        ]
      );

      Response::success($result['data'], $result['meta'], 200);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getCode());
    }
  }

  /**
   * POST /auth/refresh
   *
   * Rotates an existing refresh token and issues a new access/refresh token pair.
   *
   * The response contains the new tokens, and the caller should replace the
   * stored tokens. It also updates the access token cookie for web clients convenience.
   *
   * @return void
   * 
   * @throws ApiException Any token validation or rotation failure exception propagated from the service layer.
   */
  public function refresh(): void
  {
    try {
      $body = Request::parseJsonRequest();
      if (empty($body['refresh_token'])) {
        throw new ApiException(ErrorType::missingField('refresh_token'), 400);
      }

      $result = $this->authService->refreshTokens($body['refresh_token']);

      //  Updates the access token cookie for web clients.
      if (isset($result['data']['access_token'], $result['meta']['expires_in'])) {
        setcookie(
          'geoterra_session_token',
          $result['data']['access_token'],
          [
            'expires' => time() + (int) $result['meta']['expires_in'],
            'path' => '/',
            'domain' => '',
            'secure' => false,
            'httponly' => true,
            'samesite' => 'Lax'
          ]
        );
      }

      Response::success($result['data'], $result['meta'], 200);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getCode());
    }
  }

  /**
   * POST /logout
   *
   * Revokes all tokens belonging to the currently authenticated user.
   *
   * The method first tries to resolve the user from the current request context
   * If that fails, it attempts to extract the token from the Authorization
   * header or the session cookie and deletes the corresponding tokens.
   *
   * The access token cookie is cleared unconditionally.
   *
   * @return void
   * 
   * @throws ApiException Any failure during the logout process, propagated from the service layer.
   */
  public function logout(): void
  {
    try {
      $this->authService->logout();
      // Clear the access token cookie
      setcookie(
        'geoterra_session_token',
        '',
        [
          'expires' => time() - 3600,
          'path' => '/',
          'domain' => '',
          'secure' => false,
          'httponly' => true,
          'samesite' => 'Lax'
        ]
      );
      Response::success(['logged_out' => true], null, 200);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getCode());
    }
  }
}