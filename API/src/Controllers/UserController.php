<?php
declare(strict_types=1);

namespace Controllers;

use DTO\PermissionsDTO;
use DTO\UpdateUserDTO;
use DTO\RegisterUserDTO;
use DTO\UpdateUserRoleDTO;
use Http\Response;
use Http\Request;
use Http\ErrorType;
use Http\ApiException;
use Services\PermissionService;
use Services\UserService;
use PDO;

final class UserController
{
  private UserService $userService;

  public function __construct(private PDO $pdo)
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
   * POST /users/restore
   * Restores a soft‑deleted user account.
   * Expected JSON: { "email": "user@example.com" }
   */
  public function restore(): void
  {
    try {
      $data = Request::parseJsonRequest();
      if (empty($data['email'])) {
        throw new ApiException(ErrorType::missingField('email'), 422);
      }
      $this->userService->restoreAccount($data['email']);
      Response::success(['message' => 'Account restored successfully. You can now log in.']);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getCode());
    } catch (\Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * PUT /users/me
   * Updates the authenticated user's profile.
   */
  public function update(): void
  {
    try {
      $body = Request::parseJsonRequest();
      $dto = UpdateUserDTO::fromArray($body);
      $this->userService->updateUser($dto);
      Response::success(['message' => 'User profile updated successfully'], null, 200);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getCode());
    } catch (\Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * PUT /admin/users/{id}/role
   * Updates a user's role (admin only).
   *
   * Expected JSON: { "role": "admin" }
   *
   * @param string $id
   * @return void
   */
  public function adminUpdateRole(string $id): void
  {
    try {
      $user = Request::getUser();
      if (!$user || !PermissionService::hasPermission($user['role'],
          PermissionsDTO::MANAGE_USERS)) {
        Response::error(ErrorType::forbidden(), 403);
        return;
      }

      $body = Request::parseJsonRequest();
      $dto = UpdateUserRoleDTO::fromArray($body, $id);
      $this->userService->updateUserRole($dto);
      Response::success(['message' => 'User role updated successfully']);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getCode());
    } catch (\Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * DELETE /users/me
   * Soft‑deletes the authenticated user's account.
   */
  public function delete(): void
  {
    try {
      $this->userService->deleteCurrentUser();
      Response::success(['message' => 'User account deleted successfully'], null, 200);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getCode());
    } catch (\Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * GET /users/me
   * Returns the authenticated user's data.
   */
  public function show(): void
  {
    try {
      $result = $this->userService->getCurrentUser();
      Response::success($result['data'], $result['meta'], 200);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getCode());
    } catch (\Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * GET /users/me/session
   * Returns session user data.
   */
  public function showSession(): void
  {
    try {
      $user = $this->userService->getSessionUser();
      Response::success($user, null, 200);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getCode());
    } catch (\Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }
}