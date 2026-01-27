<?php
declare(strict_types=1);

namespace Controllers;

use Services\UserService;
use DTO\RegisterUserDTO;
use Http\Request;
use Http\Response;
use RuntimeException;

/**
 * Handles user registration HTTP requests.
 */
final class RegisterController
{
  /**
   * @param UserService $service Business logic for user registration
   */
  public function __construct(
    private UserService $service
  ) {}

  /**
   * Invokable controller entry point.
   */
  public function __invoke(): void
  {
    try {
      $dto = RegisterUserDTO::fromArray(Request::json());
      $dto->validate($dto);

      // Delegate business logic to the service layer
      $result = $this->service->register($dto);

      Response::success(
        $result['data'],
        $result['meta'],
        201
      );

    } catch (RuntimeException $e) {
      Response::error($e->getMessage(), 409);
    } catch (\Throwable $e) {
      Response::error('Internal server error', 500, ['detail' => $e->getMessage()]);
    }
  }
}
