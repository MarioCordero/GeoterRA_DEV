<?php
declare(strict_types=1);

namespace Controllers;

use Services\UserService;
use DTO\RegisterUserDTO;
use Http\ApiException;
use Http\Request;
use Http\Response;
use Http\ErrorType;

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
      $data = Request::json();
      if ($data === null) {
        Response::error(ErrorType::invalidJson(), 400);
      }

      $dto = RegisterUserDTO::fromArray($data);

      try {
        $dto->validate();
      } catch (ApiException $e) {
        Response::error($e->getError(), 422);
      }

      // Delegate business logic to the service layer
      $result = $this->service->register($dto);

      Response::success(
        $result['data'],
        $result['meta'],
        201
      );

    } catch (ApiException $e) {
      // Email ya registrado
      Response::error($e->getError(), 409);
    } catch (\Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }
}
?>