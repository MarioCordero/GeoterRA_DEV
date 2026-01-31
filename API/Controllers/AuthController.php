<?php
declare(strict_types=1);

namespace Controllers;

use Services\AuthService;
use Services\UserService;
use DTO\LoginUserDTO;
use DTO\RegisterUserDTO;
use Http\ApiException;
use Http\Request;
use Http\Response;
use Http\ErrorType;

/**
 * Handles authentication-related operations.
 *
 * This controller groups user registration and login
 * under the same authentication domain boundary.
 */
final class AuthController
{
  public function __construct(
    private AuthService $authService,
    private UserService $userService
  ) {}

  /**
   * POST /auth/refresh
   * Rotates refresh token and issues new access credentials.
   */
  public function refresh(): void
  {
    try {
      $body = Request::parseJsonRequest();

      if (empty($body['refresh_token'])) {
        throw new ApiException(
          ErrorType::missingField('refresh_token'),
          400
        );
      }

      $result = $this->authService->refreshTokens(
        $body['refresh_token']
      );

      Response::success(
        $result['data'],
        $result['meta'],
        200
      );

    } catch (ApiException $e) {
      Response::error(
        $e->getError(),
        $e->getCode()
      );

    } catch (\Throwable $e) {
      Response::error(
        ErrorType::internal($e->getMessage()),
        500
      );
    }
  }

  /**
   * POST /register
   * Creates a new user account.
   */
  public function register(): void
  {
    try {
      $data = Request::parseJsonRequest();

      $dto = RegisterUserDTO::fromArray($data);

      $result = $this->userService->registerUser($dto);

      Response::success(
        $result['data'],
        $result['meta'],
        201
      );

    } catch (ApiException $e) {
      Response::error($e->getError(), 409);
    } catch (\Throwable $e) {
      Response::error(
        ErrorType::internal($e->getMessage()),
        500
      );
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

      Response::success(
        $result['data'],
        $result['meta'],
        200
      );

    } catch (ApiException $e) {
      Response::error($e->getError(), 401);
    } catch (\Throwable $e) {
      Response::error(
        ErrorType::internal($e->getMessage()),
        500
      );
    }
  }

  /**
   * POST /logout
   * Revokes the current user session.
   */
  public function logout(): void
  {
    try {
      // ===============================
      // Authorization
      // ===============================
      $headers = getallheaders();
      $token = trim(str_replace('Bearer ', '', $headers['Authorization'] ?? ''));

      if ($token === '') {
        Response::error(
          ErrorType::missingAuthToken(),
          401
        );
        return;
      }

      // ===============================
      // Logout process
      // ===============================
      $this->authService->logout($token);

      Response::success(
        data: ['logged_out' => true],
        meta: null,
        status: 200
      );

    } catch (ApiException $e) {
      Response::error(
        $e->getError(),
        401
      );

    } catch (\Throwable $e) {
      Response::error(
        ErrorType::internal($e->getMessage()),
        500
      );
    }
  }

}
