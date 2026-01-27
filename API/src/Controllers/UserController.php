<?php
declare(strict_types=1);

namespace Controllers;

use Services\UserService;
use Http\Request;
use Http\Response;
use Repositories\UserRepository;
use Services\AuthService;
use RuntimeException;

final class UserController
{
  public function __construct(private UserService $userService, private AuthService $authService) {}

  /**
   * Get user info by token
   */
  public function __invoke(): void
  {
    try {
      $headers = getallheaders();
      $token = $headers['Authorization'] ?? '';
      $token = str_replace('Bearer ', '', $token);
      $token = trim($token);


      if (!$token) {
        Response::error('Authorization token missing', 401);
      }

      // Find session by token
      $session = $this->authService->validateToken($token);

      if (!$session) {
        Response::error('Invalid or expired token', 401);
      }

      $result = $this->userService->getUserById((int)$session['user_id']);

      Response::success($result['data'], $result['meta'], 200);

    } catch (RuntimeException $e) {
      Response::error($e->getMessage(), 404);
    } catch (\Throwable $e) {
      Response::error('Internal server error', 500, ['detail' => $e->getMessage()]);
    }
  }
}
