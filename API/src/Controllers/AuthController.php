<?php
declare(strict_types=1);

namespace Controllers;

use Services\AuthService;
use Services\UserService;
use DTO\RegisterUserDTO;
use DTO\LoginUserDTO;
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
   * POST /register
   * Creates a new user account.
   */
  public function register(): void
  {
    try {
      $data = $this->parseJsonRequest();

      $dto = RegisterUserDTO::fromArray($data);
      $this->validateDto($dto);

      $result = $this->userService->register($dto);

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
      $data = $this->parseJsonRequest();

      $dto = LoginUserDTO::fromArray($data);
      $this->validateDto($dto);

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

  /**
   * Parses and validates JSON request body.
   *
   * @return array<string, mixed>
   */
  private function parseJsonRequest(): array
  {
    $data = Request::json();

    if ($data === null) {
      Response::error(
        ErrorType::invalidJson(),
        400
      );
    }

    return $data;
  }

  /**
   * Validates a DTO instance.
   *
   * @param object $dto
   */
  private function validateDto(object $dto): void
  {
    try {
      $dto->validate();
    } catch (ApiException $e) {
      Response::error(
        $e->getError(),
        422
      );
    }
  }
}
