<?php
declare(strict_types=1);

namespace Controllers;

use DTO\UpdateUserDTO;
use DTO\RegisterUserDTO;
use Http\Response;
use Http\Request;
use Http\ErrorType;
USE Http\ApiException;
use PDO;
use Services\UserService;

final class UserController
{
  private UserService $userService;
  public function __construct(private \PDO $pdo)
  {
    $this->userService = new UserService($this->pdo);
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
      Response::success($result['data'], $result['meta'], 201);

    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getCode());
    } catch (\Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * PUT /users/me
   * Updates the authenticated user's profile information. Only fields provided in the request will be updated.
   */
  public function update(): void
  {
    try {
      $body = Request::parseJsonRequest();
      $dto = UpdateUserDTO::fromArray($body);
      $this->userService->updateUser($dto);
      Response::success(['message' => 'User profile updated successfully'],null,200);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getHttpStatus());
    } catch (\Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * DELETE /users/me
   * Deletes the authenticated user's account. This action is irreversible and will remove all user data from the system.
   */
  public function delete(): void
  {
    try {
      $this->userService->deleteCurrentUser();
      Response::success(['message' => 'User account deleted successfully'], null, 200);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getHttpStatus());
    } catch (\Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * GET /users/me
   * Get user info by token
   */
  public function show(): void
  {
    try {
      $result = $this->userService->getCurrentUser();
      Response::success($result['data'], $result['meta'], 200);
    } catch (ApiException $e) {
      Response::error($e->getError(), status: $e->getHttpStatus());
    } catch (\Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }
}