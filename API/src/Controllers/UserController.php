<?php
declare(strict_types=1);

namespace Controllers;

use Services\UserService;
use Http\Response;
use Http\ErrorType;
use Services\AuthService;
USE Http\ApiException;

final class UserController
{
  public function __construct(private UserService $userService, private AuthService $authService) {}

  /**
   * Get user info by token
   */
  public function show(): void
  {
    try {
      $headers = getallheaders();
      $token = $headers['Authorization'] ?? '';
      $token = str_replace('Bearer ', '', $token);
      $token = trim($token);

      if (!$token) {
        Response::error(ErrorType::missingAuthToken(), 401);
      }

      // Find session by token
      $session = $this->authService->validateToken($token);

      if (!$session) {
        Response::error(ErrorType::invalidToken(), 401);
      }

      $result = $this->userService->getUserById((int)$session['user_id']);

      Response::success($result['data'], $result['meta'], 200);

    } catch (ApiException $e) {
      Response::error($e->getError(), 404);
    } catch (\Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }
}
?>