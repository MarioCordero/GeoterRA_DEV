<?php
declare(strict_types=1);

namespace Controllers;

use Services\UserService;
use Http\Response;
use Http\Request;
use Http\ErrorType;
use Services\AuthService;
USE Http\ApiException;
use DTO\UpdateUserDTO;
use DTO\RegisterUserDTO;

final class UserController
{
  public function __construct(private UserService $userService, private AuthService $authService) {}

  /**
   * PUT /users/me
   */
  public function update(): void
  {
    try {
      $auth = $this->authService->requireAuth();

      $body = Request::parseJsonRequest();

      $dto = UpdateUserDTO::fromArray($body);

      $this->userService->updateUser(
        (string) $auth['user_id'],
        $dto
      );

      Response::success(
        ['message' => 'User profile updated successfully'],
        null,
        200
      );

    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getHttpStatus());
    } catch (\Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * DELETE /users/me
   */
  public function delete(): void
  {
    try {
      $auth = $this->authService->requireAuth();


      $this->userService->deleteUser(
        (string) $auth['user_id']
      );

      Response::success(
        ['message' => 'User account deleted successfully'],
        null,
        200
      );

    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getHttpStatus());
    } catch (\Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * Get user info by token
   */
  public function show(): void
  {
    try {
      $auth = $this->authService->requireAuth();

      $result = $this->userService->getUserById((string)$auth['user_id'], true);
      Response::success($result['data'], $result['meta'], 200);

    } catch (ApiException $e) {
      Response::error($e->getError(), status: $e->getHttpStatus());
    } catch (\Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

}
?>