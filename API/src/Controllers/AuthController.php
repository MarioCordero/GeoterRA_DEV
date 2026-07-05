<?php
declare(strict_types=1);

namespace Controllers;

use DTO\LoginUserDTO;
use Http\ApiException;
use Http\ErrorType;
use Http\Request;
use Http\Response;
use PDO;
use Services\AuthService;
use Throwable;

final class AuthController
{
  private AuthService $authService;

  public function __construct(private PDO $pdo)
  {
    $this->authService = new AuthService($this->pdo);
  }

  /**
   * POST /auth/login
   */
  public function login(): void
  {
    try {
      $data = Request::parseJsonRequest();
      $dto = LoginUserDTO::fromArray($data);
      $result = $this->authService->login($dto);

      if (Request::isWeb()) {
        $responseData = $this->authService->prepareWebResponse($result);
        $meta = [
          'token_type' => 'Cookie',
          'expires_in' => $result['meta']['expires_in'] ?? 5400,
          'message' => 'Session set via HTTP-only cookie',
        ];
      } else {
        $responseData = $this->authService->prepareMobileResponse($result);
        $meta = [
          'token_type' => 'Bearer',
          'expires_in' => $result['meta']['expires_in'] ?? 5400,
        ];
      }

      Response::success($responseData, $meta, 200);

    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getCode());
    } catch (Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * POST /auth/refresh
   */
  public function refresh(): void
  {
    try {
      $body = Request::parseJsonRequest();
      if (empty($body['refresh_token'])) {
        throw new ApiException(ErrorType::missingField('refresh_token'), 400);
      }

      $result = $this->authService->refreshTokens($body['refresh_token']);

      if (Request::isWeb()) {
        // Update cookie with new access token
        $accessToken = $result['data']['access_token'];
        $expiresIn = $result['meta']['expires_in'] ?? 5400;
        setcookie(
          'geoterra_session_token',
          $accessToken,
          [
            'expires' => time() + $expiresIn,
            'path' => '/',
            'domain' => '',
            'secure' => false, // configurable via EnvironmentDetector
            'httponly' => true,
            'samesite' => 'Lax',
          ]
        );

        // Return only user data (tokens are in cookie)
        $responseData = [
          'user_id' => $result['data']['user_id'],
          'message' => 'Session renewed',
        ];
        $meta = [
          'token_type' => 'Cookie',
          'expires_in' => $expiresIn,
        ];
      } else {
        // Mobile: return tokens in body
        $responseData = [
          'access_token' => $result['data']['access_token'],
          'refresh_token' => $result['data']['refresh_token'],
          'user_id' => $result['data']['user_id'],
        ];
        $meta = [
          'token_type' => 'Bearer',
          'expires_in' => $result['meta']['expires_in'] ?? 5400,
        ];
      }

      Response::success($responseData, $meta, 200);

    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getCode());
    } catch (Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * POST /auth/logout
   */
  public function logout(): void
  {
    try {
      $this->authService->logout();

      // Clear cookie for web clients
      if (Request::isWeb()) {
        setcookie(
          'geoterra_session_token', '', [
          'expires' => time() - 3600,
          'path' => '/',
          'domain' => '',
          'secure' => false,
          'httponly' => true,
          'samesite' => 'Lax',
        ]
        );
      }

      Response::success(['logged_out' => true], null, 200);

    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getCode());
    } catch (Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }
}